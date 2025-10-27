import { NextResponse } from "next/server"
// import {list_of_products} from '@/data/products'
export async function GET() {

  const res = await fetch('https://msaidizi.nsaro.com/products/', {
    // next: { revalidate: 10 }
  })
  const data = await res.json()
  const products = data.results;
  console.log("Fetched products data:", data);

  // Return the new, larger dataset with the same structure
  return NextResponse.json({ products});
}