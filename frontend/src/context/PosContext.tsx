'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { Product, PaymentMethod } from '@pharmacy-point/types';

/**
 * Default tax rate for pharmacy sales (8.5%).
 */
export const DEFAULT_TAX_RATE = 0.085;

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

interface PosState {
  items: CartItem[];
  customerId: string | null;
  paymentMethod: PaymentMethod;
  taxRate: number;
}

type PosAction =
  | { type: 'ADD_ITEM'; product: Product; quantity?: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CUSTOMER'; customerId: string | null }
  | { type: 'SET_PAYMENT_METHOD'; paymentMethod: PaymentMethod }
  | { type: 'SET_TAX_RATE'; taxRate: number };

interface PosContextType {
  items: CartItem[];
  customerId: string | null;
  paymentMethod: PaymentMethod;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customerId: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  getCartItem: (productId: string) => CartItem | undefined;
  canAddToCart: (product: Product, quantity?: number) => boolean;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

const initialState: PosState = {
  items: [],
  customerId: null,
  paymentMethod: 'cash',
  taxRate: DEFAULT_TAX_RATE,
};

function posReducer(state: PosState, action: PosAction): PosState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action;
      const requestedQty = quantity;

      // Check stock availability — clamp to available quantity
      if (product.quantity <= 0) {
        return state;
      }

      const existingItem = state.items.find((item) => item.productId === product.id);

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + requestedQty, product.quantity);
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === product.id ? { ...item, quantity: newQuantity } : item
          ),
        };
      }

      const finalQuantity = Math.min(requestedQty, product.quantity);
      if (finalQuantity <= 0) {
        return state;
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            productId: product.id,
            product,
            quantity: finalQuantity,
            price: product.price,
          },
        ],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.productId),
      };

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action;
      const item = state.items.find((i) => i.productId === productId);

      if (!item) {
        return state;
      }

      // Clamp quantity to available stock
      const clampedQty = Math.min(quantity, item.product.quantity);

      if (clampedQty <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.productId !== productId),
        };
      }

      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity: clampedQty } : i
        ),
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        customerId: null,
        paymentMethod: 'cash',
        taxRate: state.taxRate,
      };

    case 'SET_CUSTOMER':
      return {
        ...state,
        customerId: action.customerId,
      };

    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.paymentMethod,
      };

    case 'SET_TAX_RATE':
      return {
        ...state,
        taxRate: action.taxRate,
      };

    default:
      return state;
  }
}

export function PosProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(posReducer, initialState);

  // Computed values
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * state.taxRate;
  const total = subtotal + taxAmount;

  const addItem = useCallback((product: Product, quantity?: number) => {
    dispatch({ type: 'ADD_ITEM', product, quantity: quantity ?? 1 });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const setCustomer = useCallback((customerId: string | null) => {
    dispatch({ type: 'SET_CUSTOMER', customerId });
  }, []);

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', paymentMethod: method });
  }, []);

  const getCartItem = useCallback(
    (productId: string) => state.items.find((item) => item.productId === productId),
    [state.items]
  );

  const canAddToCart = useCallback(
    (product: Product, quantity = 1) => {
      const existing = state.items.find((item) => item.productId === product.id);
      const currentQty = existing?.quantity ?? 0;
      return currentQty + quantity <= product.quantity && product.quantity > 0;
    },
    [state.items]
  );

  return (
    <PosContext.Provider
      value={{
        items: state.items,
        customerId: state.customerId,
        paymentMethod: state.paymentMethod,
        taxRate: state.taxRate,
        subtotal,
        taxAmount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setCustomer,
        setPaymentMethod,
        getCartItem,
        canAddToCart,
      }}
    >
      {children}
    </PosContext.Provider>
  );
}

export function usePos() {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
}
