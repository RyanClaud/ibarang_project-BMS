import * as fs from 'fs';
import * as path from 'path';

// Import the Philippine geographic data library
const phGeoData = require('ph-geo-admin-divisions');

interface Barangay {
  name: string;
  municipality: string;
  province: string;
  region: string;
  code?: string;
}

// Generate CSV for Oriental Mindoro barangays
async function generateOrientalMindoroCSV() {
  console.log('Fetching Philippine geographic data...');
  
  // Get all regions
  const regions = phGeoData.regions;
  
  // Find MIMAROPA region (Region IV-B)
  const mimaropa = regions.find((r: any) => 
    r.name.includes('MIMAROPA') || r.name.includes('IV-B')
  );
  
  if (!mimaropa) {
    console.error('MIMAROPA region not found');
    return;
  }
  
  console.log('Found region:', mimaropa.name);
  
  // Get provinces in MIMAROPA
  const provinces = phGeoData.getProvincesByRegion(mimaropa.code);
  
  // Find Oriental Mindoro
  const orientalMindoro = provinces.find((p: any) => 
    p.name.includes('Oriental Mindoro')
  );
  
  if (!orientalMindoro) {
    console.error('Oriental Mindoro province not found');
    console.log('Available provinces:', provinces.map((p: any) => p.name));
    return;
  }
  
  console.log('Found province:', orientalMindoro.name);
  
  // Get municipalities in Oriental Mindoro
  const municipalities = phGeoData.getMunicipalitiesByProvince(orientalMindoro.code);
  
  console.log(`Found ${municipalities.length} municipalities`);
  
  const barangays: Barangay[] = [];
  
  // Get barangays for each municipality
  for (const municipality of municipalities) {
    console.log(`Processing ${municipality.name}...`);
    
    const munBarangays = phGeoData.getBarangaysByMunicipality(municipality.code);
    
    for (const barangay of munBarangays) {
      barangays.push({
        name: barangay.name,
        municipality: municipality.name,
        province: 'Oriental Mindoro',
        region: 'MIMAROPA',
        code: barangay.code
      });
    }
  }
  
  console.log(`Total barangays found: ${barangays.length}`);
  
  // Generate CSV content
  const csvHeader = 'name,municipality,province,region,code\n';
  const csvRows = barangays.map(b => 
    `${b.name},${b.municipality},${b.province},${b.region},${b.code || ''}`
  ).join('\n');
  
  const csvContent = csvHeader + csvRows;
  
  // Write to file
  const outputPath = path.join(process.cwd(), 'oriental_mindoro_barangays_psgc.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  
  console.log(`\nCSV file generated successfully: ${outputPath}`);
  console.log(`Total records: ${barangays.length}`);
  
  // Show sample data
  console.log('\nSample data (first 5 barangays):');
  barangays.slice(0, 5).forEach(b => {
    console.log(`  ${b.name}, ${b.municipality}`);
  });
}

// Run the script
generateOrientalMindoroCSV().catch(console.error);
