import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  // 1. Fetch data from the external API
  const res = await fetch(`${API_URL}/api/products`, { 
    next: { revalidate: 0 } 
  }); 

  // Check for failed fetch response
  if (!res.ok) {
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: res.status });
  }

  const responseData = await res.json();
  
  // 2. 🎯 CRITICAL FIX: Extract the array from the 'products' property
  const productsArray = responseData.products;

  // 3. Ensure the extracted data is an array before proceeding
  if (!Array.isArray(productsArray)) {
    // If the data structure changes, log an error and return empty array
    console.error('Expected "products" array not found in API response. Received:', responseData);
    return NextResponse.json([], { status: 500 });
  }

  // Handle case where no search query is provided
  if (!query) {
    return NextResponse.json([], { status: 200 });
  }

  // Pre-process the query for case-insensitive filtering
  const lowerCaseQuery = query.toLowerCase();

  // 4. Filtering Logic (using the corrected array)
  const mockResults = productsArray.filter(item => {
    // Check if item.name exists and includes the query
    const nameMatch = item.name 
        ? item.name.toLowerCase().includes(lowerCaseQuery) 
        : false;
        
    // Check if item.partNumber exists and includes the query
    const partNumberMatch = item.partNumber 
        ? item.partNumber.toLowerCase().includes(lowerCaseQuery) 
        : false;
        
    // Return true if either name or partNumber matches
    return nameMatch || partNumberMatch;
  });

  return NextResponse.json(mockResults);
}