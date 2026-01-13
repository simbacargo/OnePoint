// AppProvider.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// --- Define types ---
interface Product {
  id: string;
  name: string;
  price: number;
  buying_price: number;
  partNumber?: string;
}

interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtSale: number;
  buyingPriceAtSale: number;
  customerName: string;
  saleDate: string;
  totalAmount: number;
  profit: number;
}

// NEW: User type (Google or email login)
interface UserInfo {
  name: string;
  email: string;
  picture?: string;
}

// Add userInfo to AppContextType
interface AppContextType {
  is_selected_id: string | number | undefined;
  set_is_selected_id: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  is_logged_in: boolean;
  set_is_logged_in: React.Dispatch<React.SetStateAction<number>>;
  Iliyochaguliwa: string;
  setIliyochaguliwa: React.Dispatch<React.SetStateAction<string>>;

  list_of_products: Product[];
  updateProducts: (newProducts: Product[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (productId: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;

  list_of_sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => void;

  total_sales_value: number;
  total_profit_value: number;

  userInfo: UserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = PropsWithChildren<{}>;

function AppProvider({ children }: AppProviderProps) {
  const [is_logged_in, set_is_logged_in] = useState<boolean>(false);
  const [is_selected_id, set_is_selected_id] = useState<string | number | undefined>(undefined);
  const [Iliyochaguliwa, setIliyochaguliwa] = useState<string>("");

  const [list_of_products, set_list_of_products] = useState<Product[]>([]);
  const PRODUCTS_STORAGE_KEY = 'cached_products';

  const [list_of_sales, set_list_of_sales] = useState<Sale[]>([]);
  const SALES_STORAGE_KEY = 'cached_sales';

  const [total_sales_value, set_total_sales_value] = useState<number>(0);
  const [total_profit_value, set_total_profit_value] = useState<number>(0);

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [password_user_session, set_password_user_session] = useState<string | null>(null);

  const USER_STORAGE_KEY = '@user';
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          setUserInfo(JSON.parse(storedUser));
          set_is_logged_in(true); // Mark user as logged in
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    };

    loadUser();
  // --- Load user info on mount ---
  useEffect(() => {
    loadUser();
  }, []);

  // --- Product logic (unchanged) ---
  const loadProductsFromCache = useCallback(async () => {
    try {
      const cachedData = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (cachedData !== null) {
        const products: Product[] = JSON.parse(cachedData);
        set_list_of_products(products);
        console.log("Products loaded from cache.");
      } else {
        console.log("No products found in cache.");
        set_list_of_products([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      set_list_of_products([]);
    }
  }, []);

  const saveProductsToCache = useCallback(async (products: Product[]) => {
    try {
      await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error("Error saving products:", error);
    }
  }, []);

  useEffect(() => {
    loadProductsFromCache();
  }, [loadProductsFromCache]);

  const updateProducts = useCallback((newProducts: Product[]) => {
    set_list_of_products(newProducts);
    saveProductsToCache(newProducts);
  }, [saveProductsToCache]);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const productToAdd = { ...product, id: uuidv4(), buying_price: product.buying_price || 0 };
    const updatedProducts = [...list_of_products, productToAdd];
    updateProducts(updatedProducts);
  }, [list_of_products, updateProducts]);

  const editProduct = useCallback((productId: string, updatedFields: Partial<Product>) => {
    const updatedProducts = list_of_products.map(product =>
      product.id === productId ? { ...product, ...updatedFields } : product
    );
    updateProducts(updatedProducts);
  }, [list_of_products, updateProducts]);

  const deleteProduct = useCallback((productId: string) => {
    const updatedProducts = list_of_products.filter(product => product.id !== productId);
    updateProducts(updatedProducts);
  }, [list_of_products, updateProducts]);

  // --- Sales logic ---
  const loadSalesFromCache = useCallback(async () => {
    try {
      const cachedData = await AsyncStorage.getItem(SALES_STORAGE_KEY);
      if (cachedData !== null) {
        const sales: Sale[] = JSON.parse(cachedData);
        set_list_of_sales(sales);
        console.log("Sales loaded from cache.");
      } else {
        set_list_of_sales([]);
      }
    } catch (error) {
      console.error("Error loading sales:", error);
      set_list_of_sales([]);
    }
  }, []);

  const saveSalesToCache = useCallback(async (sales: Sale[]) => {
    try {
      await AsyncStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    } catch (error) {
      console.error("Error saving sales:", error);
    }
  }, []);

  useEffect(() => {
    loadSalesFromCache();
  }, [loadSalesFromCache]);

  const addSale = useCallback((sale: Omit<Sale, 'id'>) => {
    const updatedSales = [...list_of_sales, { ...sale, id: uuidv4() }];
    set_list_of_sales(updatedSales);
    saveSalesToCache(updatedSales);
  }, [list_of_sales, saveSalesToCache]);

  // --- Sales/Profit Totals ---
  useEffect(() => {
    const total = list_of_sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    set_total_sales_value(total);
  }, [list_of_sales]);

  useEffect(() => {
    const profit = list_of_sales.reduce((sum, sale) => sum + sale.profit, 0);
    set_total_profit_value(profit);
  }, [list_of_sales]);

  // --- Final context value ---
  const contextValue: AppContextType = {
    is_selected_id,
    set_is_selected_id,
    is_logged_in,
    set_is_logged_in,
    Iliyochaguliwa,
    setIliyochaguliwa,
    list_of_products,
    updateProducts,
    addProduct,
    editProduct,
    deleteProduct,
    list_of_sales,
    addSale,
    total_sales_value,
    total_profit_value,
    userInfo,
    setUserInfo, 
    password_user_session, set_password_user_session
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
