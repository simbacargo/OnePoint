import React from 'react'

export default function Page({ params }) {
  console.log(params);
  
   const { slug } = params; // Destructure params directly
   
   return (
     <div>
       <center>{slug}</center>
     </div>
   )
}
