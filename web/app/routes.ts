import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/sales", "routes/sales.tsx"),
    route("products", "routes/products.tsx"),
    route("register", "routes/register.tsx"),
    route("record-sale", "routes/record-sale.tsx"),
    route("verify", "routes/verify-sales.tsx"),
	route("customers", "routes/customers.tsx"),
	route("customers/new", "routes/newCustomers.tsx"),
	route("profile", "routes/profile.tsx"),
	route("login", "routes/auth/login.tsx"),
	route("signup", "routes/signup.tsx"),
	route("upgrade-subscription", "routes/UpgradeSubscription.tsx"),
	route("payment-history", "routes/PaymentHistory.tsx"),
	route('products/:productId/edit', 'routes/product.tsx'),
	route('customers/:customerId', 'routes/CustomerDetail.tsx'),
] satisfies RouteConfig;
