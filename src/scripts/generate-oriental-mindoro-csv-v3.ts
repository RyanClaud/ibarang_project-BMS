import * as fs from 'fs';
import * as path from 'path';

// Import the Philippine geographic data library
const phData = require('ph-geo-admin-divisions');

interface Barangay {
  name: string;
  municipality: string;
  province: string;
  region: string;
  code: string;
}

// Generate CSV for Oriental Mindoro barangays
async function generateOrientalMindoroCSV() {
  console.log('Fetching Philippine geographic data...');
  
  const { regions, provinces, municipalities: municipalitiesData, baranggays } = phData;
  
  console.log(`Total regions: ${regions.length}`);
  console.log(`Total provinces: ${provinces.length}`);
  console.log(`Total municipalities: ${municipalitiesData.length}`);
  console.log(`Total barangays: ${baranggays.length}`);
  
  // Find Oriental Mindoro province
  const orientalMindoro = provinces.find((p: any) => 
    p.name && p.name.toLowerCase().includes('oriental mindoro')
  );
  
  if (!orientalMindoro) {
    console.error('\nOriental Mindoro not found!');
    console.log('Sample provinces:', provinces.slice(0, 10).map((p: any) => p.name));
    return;
  }
  
  console.log(`\nFound province: ${orientalMindoro.name} (ID: ${orientalMindoro.provinceId})`);
  
  // Get municipalities in Oriental Mindoro
  const orientalMindoroMunicipalities = municipalitiesData.filter((m: any) => 
    m.provinceId === orientalMindoro.provinceId
  );
  
  console.log(`Found ${orientalMindoroMunicipalities.length} municipalities`);
  
  // Get barangays for each municipality
  const formattedBarangays: Barangay[] = [];
  
  for (const municipality of orientalMindoroMunicipalities) {
    const munBarangays = baranggays.filter((b: any) => 
      b.municipalityId === municipality.municipalityId &&
      b.provinceId === orientalMindoro.provinceId
    );
    
    console.log(`  ${municipality.name}: ${munBarangays.length} barangays`);
    
    for (const barangay of munBarangays) {
      formattedBarangays.push({
        name: barangay.name,
        municipality: municipality.name,
        province: 'Oriental Mindoro',
        region: 'MIMAROPA',
        code: barangay.psgcId || ''
      });
    }
  }
  
  console.log(`\nTotal barangays collected: ${formattedBarangays.length}`);
  
  // Sort by municipality then barangay name
  formattedBarangays.sort((a, b) => {
    if (a.municipality !== b.municipality) {
      return a.municipality.localeCompare(b.municipality);
    }
    return a.name.localeCompare(b.name);
  });
  
  // Generate CSV content
  const csvHeader = 'name,municipality,province,region,code\n';
  const csvRows = formattedBarangays.map(b => 
    `"${b.name}","${b.municipality}","${b.province}","${b.region}","${b.code}"`
  ).join('\n');
  
  const csvContent = csvHeader + csvRows;
  
  // Write to file
  const outputPath = path.join(process.cwd(), 'oriental_mindoro_barangays_psgc.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  
  console.log(`\nCSV file generated successfully: ${outputPath}`);
  console.log(`Total records: ${formattedBarangays.length}`);
  
  // Show sample data
  console.log('\nSample data (first 10 barangays):');
  formattedBarangays.slice(0, 10).forEach(b => {
    console.log(`  ${b.name}, ${b.municipality} (${b.code})`);
  });
  
  console.log('\nLast 5 barangays:');
  formattedBarangays.slice(-5).forEach(b => {
    console.log(`  ${b.name}, ${b.municipality} (${b.code})`);
  });
}

// Run the script
generateOrientalMindoroCSV().catch(console.error);
