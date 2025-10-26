import { NextResponse } from "next/server"
// import {list_of_products} from '@/data/products'
export async function GET() {

  const res = await fetch('http://localhost:8000/products/', {
    // next: { revalidate: 10 }
  })
  const data = await res.json()
  
  // Create an empty array to store the duplicated products
  // let data = [];
  let duplicatedProducts = [];
  
  // Duplicate the products 10 times to create a larger dataset
  for (let i = 0; i < 1; i++) {
    duplicatedProducts = duplicatedProducts.concat(data);
  }
  
  // Return the new, larger dataset with the same structure
  return NextResponse.json({ ...data, products: duplicatedProducts });
}