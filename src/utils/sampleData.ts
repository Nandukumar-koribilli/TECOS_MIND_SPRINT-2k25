import { supabase } from '../lib/supabase';

export const createSampleLands = async (userId: string) => {
  // First get the user's profile to include contact info
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name, phone, email')
    .eq('id', userId)
    .single();

  // Create basic sample lands without the new columns first
  const basicSampleLands = [
    {
      owner_id: userId,
      title: "Prime Agricultural Land - 50 Acres",
      description: "Beautiful fertile land perfect for farming. Located near water source with good soil quality.",
      location: "Punjab, India",
      area: 50,
      price_per_acre: 50000,
      soil_type: "Loamy",
      water_availability: "Well and canal nearby",
      status: "available"
    },
    {
      owner_id: userId,
      title: "Organic Farm Land - 25 Acres",
      description: "Certified organic land suitable for organic farming. Has been chemical-free for 5 years.",
      location: "Karnataka, India",
      area: 25,
      price_per_acre: 75000,
      soil_type: "Clay loam",
      water_availability: "Borewell and river access",
      status: "available"
    },
    {
      owner_id: userId,
      title: "Commercial Farm Land - 100 Acres",
      description: "Large commercial farming land with modern irrigation facilities.",
      location: "Maharashtra, India",
      area: 100,
      price_per_acre: 30000,
      soil_type: "Sandy loam",
      water_availability: "Drip irrigation system",
      status: "available"
    }
  ];

  try {
    // First try to insert with the new columns
    const sampleLandsWithContact = basicSampleLands.map(land => ({
      ...land,
      owner_name: userProfile?.full_name || "Sample Landowner",
      owner_phone: userProfile?.phone || "+91-9876543210",
      owner_email: userProfile?.email || "landowner@example.com"
    }));

    const { data, error } = await supabase
      .from('lands')
      .insert(sampleLandsWithContact);

    if (error) {
      console.error('Error creating sample lands with contact info:', error);
      
      // If the new columns don't exist, try without them
      console.log('Trying to create sample lands without contact columns...');
      const { data: basicData, error: basicError } = await supabase
        .from('lands')
        .insert(basicSampleLands);

      if (basicError) {
        console.error('Error creating basic sample lands:', basicError);
        return false;
      }

      console.log('Basic sample lands created successfully:', basicData);
      return true;
    }

    console.log('Sample lands with contact info created successfully:', data);
    return true;
  } catch (err) {
    console.error('Error in createSampleLands:', err);
    return false;
  }
};
