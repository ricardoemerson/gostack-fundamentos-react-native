import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();

      const data = await AsyncStorage.getItem('@GoMarketplace:cartProducts');
      console.log('data: ', data);

      if (data) {
        setProducts(JSON.parse(data));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      let cartProduct = products.find(p => p.id === product.id);

      if (cartProduct) {
        increment(cartProduct.id);
      } else {
        cartProduct = { ...product, quantity: 1 };
        setProducts([...products, cartProduct]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cartProducts',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const cartProductIndex = products.findIndex(p => p.id === id);

      if (cartProductIndex !== -1) {
        const cartProduct = products[cartProductIndex];

        cartProduct.quantity += 1;

        const cartProductList = products;

        cartProductList.splice(cartProductIndex, 1, cartProduct);

        setProducts([...cartProductList]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cartProducts',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const cartProductIndex = products.findIndex(p => p.id === id);

      if (cartProductIndex !== -1) {
        const cartProduct = products[cartProductIndex];

        cartProduct.quantity -= 1;

        const cartProductList = products;

        cartProductList.splice(cartProductIndex, 1, cartProduct);

        setProducts([...cartProductList]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cartProducts',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
