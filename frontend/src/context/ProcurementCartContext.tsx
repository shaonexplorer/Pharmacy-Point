'use client';

/**
 * ProcurementCartContext — state management for the supplier procurement cart.
 *
 * This is the procurement counterpart to PosContext. While PosContext manages
 * the customer-facing sales cart (with loyalty points, credit sales, discounts),
 * ProcurementCartContext manages the supplier-facing purchase cart (with
 * supplier/representative selection, expected delivery dates, cost pricing).
 *
 * The cart is provider-scoped at the app-shell level so it persists across
 * navigation between the inventory page, suppliers page, and procurement page.
 */
import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { Product } from '@pharmacy-point/types';

export interface ProcurementCartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
}

interface ProcurementCartState {
  items: ProcurementCartItem[];
  supplierId: string | null;
  representativeId: string | null;
  expectedDeliveryDate: string | null;
  notes: string;
}

type ProcurementAction =
  | { type: 'ADD_ITEM'; product: Product; quantity?: number; unitPrice?: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_ITEMS' }
  | { type: 'SET_SUPPLIER'; supplierId: string | null }
  | { type: 'SET_REPRESENTATIVE'; representativeId: string | null }
  | { type: 'SET_EXPECTED_DELIVERY_DATE'; date: string | null }
  | { type: 'SET_NOTES'; notes: string }
  | { type: 'RESET_CART' };

interface ProcurementCartContextType {
  items: ProcurementCartItem[];
  supplierId: string | null;
  representativeId: string | null;
  expectedDeliveryDate: string | null;
  notes: string;
  subtotal: number;
  itemCount: number;
  totalQuantity: number;
  isEmpty: boolean;
  addItem: (product: Product, quantity?: number, unitPrice?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearItems: () => void;
  setSupplier: (supplierId: string | null) => void;
  setRepresentative: (representativeId: string | null) => void;
  setExpectedDeliveryDate: (date: string | null) => void;
  setNotes: (notes: string) => void;
  resetCart: () => void;
  getCartItem: (productId: string) => ProcurementCartItem | undefined;
}

const ProcurementCartContext = createContext<ProcurementCartContextType | undefined>(
  undefined
);

const initialState: ProcurementCartState = {
  items: [],
  supplierId: null,
  representativeId: null,
  expectedDeliveryDate: null,
  notes: '',
};

function procurementCartReducer(
  state: ProcurementCartState,
  action: ProcurementAction
): ProcurementCartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1, unitPrice } = action;
      const requestedQty = Math.max(1, quantity);

      const existingItem = state.items.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + requestedQty;
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: newQuantity }
              : item
          ),
        };
      }

      // Default unitPrice to product's current price
      const resolvedPrice = unitPrice ?? product.price;

      return {
        ...state,
        items: [
          ...state.items,
          {
            productId: product.id,
            product,
            quantity: requestedQty,
            unitPrice: resolvedPrice,
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
      const clampedQty = Math.max(1, quantity);

      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === productId ? { ...item, quantity: clampedQty } : item
        ),
      };
    }

    case 'CLEAR_ITEMS':
      return { ...state, items: [] };

    case 'SET_SUPPLIER':
      return { ...state, supplierId: action.supplierId, representativeId: null };

    case 'SET_REPRESENTATIVE':
      return { ...state, representativeId: action.representativeId };

    case 'SET_EXPECTED_DELIVERY_DATE':
      return { ...state, expectedDeliveryDate: action.date };

    case 'SET_NOTES':
      return { ...state, notes: action.notes };

    case 'RESET_CART':
      return initialState;

    default:
      return state;
  }
}

export function ProcurementCartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(procurementCartReducer, initialState);

  // Computed values
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const itemCount = state.items.length;
  const totalQuantity = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const isEmpty = state.items.length === 0;

  const addItem = useCallback((product: Product, quantity?: number, unitPrice?: number) => {
    dispatch({ type: 'ADD_ITEM', product, quantity, unitPrice });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
  }, []);

  const clearItems = useCallback(() => {
    dispatch({ type: 'CLEAR_ITEMS' });
  }, []);

  const setSupplier = useCallback((supplierId: string | null) => {
    dispatch({ type: 'SET_SUPPLIER', supplierId });
  }, []);

  const setRepresentative = useCallback((representativeId: string | null) => {
    dispatch({ type: 'SET_REPRESENTATIVE', representativeId });
  }, []);

  const setExpectedDeliveryDate = useCallback((date: string | null) => {
    dispatch({ type: 'SET_EXPECTED_DELIVERY_DATE', date });
  }, []);

  const setNotes = useCallback((notes: string) => {
    dispatch({ type: 'SET_NOTES', notes });
  }, []);

  const resetCart = useCallback(() => {
    dispatch({ type: 'RESET_CART' });
  }, []);

  const getCartItem = useCallback(
    (productId: string) =>
      state.items.find((item) => item.productId === productId),
    [state.items]
  );

  return (
    <ProcurementCartContext.Provider
      value={{
        items: state.items,
        supplierId: state.supplierId,
        representativeId: state.representativeId,
        expectedDeliveryDate: state.expectedDeliveryDate,
        notes: state.notes,
        subtotal,
        itemCount,
        totalQuantity,
        isEmpty,
        addItem,
        removeItem,
        updateQuantity,
        clearItems,
        setSupplier,
        setRepresentative,
        setExpectedDeliveryDate,
        setNotes,
        resetCart,
        getCartItem,
      }}
    >
      {children}
    </ProcurementCartContext.Provider>
  );
}

export function useProcurementCart() {
  const context = useContext(ProcurementCartContext);
  if (!context) {
    throw new Error('useProcurementCart must be used within a ProcurementCartProvider');
  }
  return context;
}
