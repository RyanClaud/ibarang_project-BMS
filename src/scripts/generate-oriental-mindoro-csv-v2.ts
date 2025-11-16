import * as fs from 'fs';
import * as path from 'path';

// Import the Philippine geographic data library
const phData = require('ph-geo-admin-divisions');
const { regions, provinces, baranggays } = phData;
const municipalitiesData = phData.municipalities;

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
  console.log(`Total regions: ${regions.length}`);
  console.log(`Total provinces: ${provinces.length}`);
  console.log(`Total municipalities: ${municipalitiesData.length}`);
  console.log(`Total barangays: ${baranggays.length}`);
  
  // Filter Oriental Mindoro barangays
  const orientalMindoroBarangays = baranggays.filter((b: any) => 
    b.province && b.province.toLowerCase().includes('oriental mindoro')
  );
  
  console.log(`\nOriental Mindoro barangays found: ${orientalMindoroBarangays.length}`);
  
  if (orientalMindoroBarangays.length === 0) {
    // Try different filtering approaches
    console.log('\nTrying alternative search...');
    console.log('Sample barangay structure:', JSON.stringify(baranggays[0], null, 2));
    
    // Check what provinces are available
    const uniqueProvinces = [...new Set(baranggays.map((b: any) => b.province))];
    console.log('\nAvailable provinces:', uniqueProvinces.slice(0, 20));
    
    return;
  }
  
  // Transform to our format
  const formattedBarangays: Barangay[] = orientalMindoroBarangays.map((b: any) => ({
    name: b.name || b.baranggay || b.brgy,
    municipality: b.municipality || b.city || b.mun,
    province: 'Oriental Mindoro',
    region: 'MIMAROPA',
    code: b.code || b.psgc || ''
  }));
  
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
  
  // Show municipalities
  const municipalitiesList = [...new Set(formattedBarangays.map(b => b.municipality))];
  console.log(`\nMunicipalities (${municipalitiesList.length}):`);
  municipalitiesList.forEach(m => {
    const count = formattedBarangays.filter(b => b.municipality === m).length;
    console.log(`  ${m}: ${count} barangays`);
  });
  
  // Show sample data
  console.log('\nSample data (first 10 barangays):');
  formattedBarangays.slice(0, 10).forEach(b => {
    console.log(`  ${b.name}, ${b.municipality}`);
  });
}

// Run the script
generateOrientalMindoroCSV().catch(console.error);
