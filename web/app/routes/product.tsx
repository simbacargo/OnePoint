import { useNavigate, Form } from "react-router"; // Use Form (capital F)

const server_url = "https://msaidizi.nsaro.com/api/productdetails/571/";

export async function actioen({ request }) {
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");

    const response = await fetch(server_url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
			"Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({ name, description }),
    });

    // It's important to return something!
    return { ok: response.ok };
}
// Change 'action' to 'clientAction' to allow localStorage access
export async function clientAction({ request }) {
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");

    const response = await fetch(server_url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({ name, description }),
    });

    return { ok: response.ok };
}
export default function Product() {
    const navigate = useNavigate();
    
    return (
        <div className="text-black">
            <h1>Product</h1>
            {/* 1. Changed to <Form> 
               2. Removed action={action} 
               React Router now knows to call the action() function above 
            */}
            <Form method="post">
                <input type="text" name="name" placeholder="Product Name" />
                <input type="text" name="description" placeholder="Description" />
                <button type="submit">Submit</button>
            </Form>
            
            <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
}
