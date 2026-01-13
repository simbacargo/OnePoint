import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/sales", "routes/sales.tsx"),
    route("products", "routes/products.tsx"),
    route("register", "routes/register.tsx"),
    route("record-sale", "routes/record-sale.tsx"),
    route("verify", "routes/verify-sales.tsx"),
	route("customers", "routes/customers.tsx"),
	route("profile", "routes/profile.tsx"),
	route("login", "routes/auth/login.tsx"),
	route("signup", "routes/signup.tsx"),
] satisfies RouteConfig;
