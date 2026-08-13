import { createContext, useEffect, useRef, useState } from 'react'
import { BASKET_USER_STORAGE_KEY, DEFAULT_USER_NAME } from '../constants/basketConstants'
import { deleteBasket, getBasket, storeBasket } from '../services/basketService'

export const BasketContext = createContext(null)

function getStoredUserName() {
  const storedUserName = window.localStorage.getItem(BASKET_USER_STORAGE_KEY)

  if (storedUserName?.trim()) {
    return storedUserName
  }

  window.localStorage.setItem(BASKET_USER_STORAGE_KEY, DEFAULT_USER_NAME)
  return DEFAULT_USER_NAME
}

function createEmptyCart(userName) {
  return {
    userName,
    items: [],
    totalPrice: 0,
  }
}

function calculateTotalPrice(items) {
  return items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0)
}

function normalizeCart(cart, userName) {
  const items = Array.isArray(cart?.items) ? cart.items : []

  return {
    userName: cart?.userName || userName,
    items,
    totalPrice: calculateTotalPrice(items),
  }
}

function validateCart(cart) {
  if (!cart.userName?.trim()) {
    throw new Error('El usuario del carrito es obligatorio.')
  }

  if (!Array.isArray(cart.items)) {
    throw new Error('Los productos del carrito deben enviarse como una lista.')
  }

  for (const item of cart.items) {
    if (!item.productId || item.productId === '00000000-0000-0000-0000-000000000000') {
      throw new Error('Cada producto del carrito debe tener un identificador valido.')
    }

    if (!item.productName?.trim()) {
      throw new Error('Cada producto del carrito debe tener un nombre.')
    }

    if (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0) {
      throw new Error('La cantidad de cada producto debe ser mayor que cero.')
    }

    if (!Number.isFinite(Number(item.price)) || Number(item.price) < 0) {
      throw new Error('El precio de cada producto debe ser mayor o igual que cero.')
    }
  }
}

function mapProductToBasketItem(product) {
  return {
    productId: product.id,
    productName: product.name,
    price: Number(product.price),
    quantity: 1,
    color: 'Default',
  }
}

export function BasketProvider({ children }) {
  const [userName, setUserName] = useState(getStoredUserName)
  const [cart, setCart] = useState(() => createEmptyCart(userName))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState(null)
  const isMountedRef = useRef(true)
  const actionLockRef = useRef(false)
  const notificationTimeoutRef = useRef(null)

  const showNotification = (message, type = 'success') => {
    if (!isMountedRef.current) {
      return
    }

    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current)
    }

    setNotification({ message, type })

    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const persistCart = async (nextCart, successMessage) => {
    if (actionLockRef.current) {
      return null
    }

    actionLockRef.current = true
    setIsSaving(true)
    setError('')

    try {
      validateCart(nextCart)

      if (nextCart.items.length === 0) {
        await deleteBasket(nextCart.userName)
      } else {
        await storeBasket(nextCart)
      }

      if (!isMountedRef.current) {
        return null
      }

      setCart(nextCart)
      showNotification(successMessage)
      return nextCart
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message)
        showNotification(err.message, 'error')
      }
    } finally {
      actionLockRef.current = false

      if (isMountedRef.current) {
        setIsSaving(false)
      }
    }
  }

  const refreshBasket = async () => {
    setIsLoading(true)
    setError('')

    try {
      const currentCart = await getBasket(userName)
      if (isMountedRef.current) {
        setCart(normalizeCart(currentCart, userName))
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message)
        showNotification(err.message, 'error')
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    let ignore = false
    isMountedRef.current = true

    async function loadBasket() {
      setIsLoading(true)
      setError('')

      try {
        const currentCart = await getBasket(userName)

        if (!ignore && isMountedRef.current) {
          setCart(normalizeCart(currentCart, userName))
        }
      } catch (err) {
        if (!ignore && isMountedRef.current) {
          setError(err.message)
          showNotification(err.message, 'error')
        }
      } finally {
        if (!ignore && isMountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    loadBasket()

    return () => {
      ignore = true
      isMountedRef.current = false

      if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [userName])

  const addProduct = async (product) => {
    const basketItem = mapProductToBasketItem(product)
    const existingItem = cart.items.find((item) => item.productId === basketItem.productId)
    const nextItems = existingItem
      ? cart.items.map((item) =>
          item.productId === basketItem.productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      : [...cart.items, basketItem]
    const nextCart = normalizeCart({ ...cart, items: nextItems }, userName)

    await persistCart(nextCart, 'Producto agregado al carrito.')
  }

  const increaseQuantity = async (productId) => {
    const nextItems = cart.items.map((item) =>
      item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
    )
    const nextCart = normalizeCart({ ...cart, items: nextItems }, userName)

    await persistCart(nextCart, 'Cantidad actualizada.')
  }

  const decreaseQuantity = async (productId) => {
    const nextItems = cart.items
      .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
      .filter((item) => item.quantity > 0)
    const nextCart = normalizeCart({ ...cart, items: nextItems }, userName)

    await persistCart(nextCart, nextItems.length ? 'Cantidad actualizada.' : 'Producto eliminado del carrito.')
  }

  const removeProduct = async (productId) => {
    const nextItems = cart.items.filter((item) => item.productId !== productId)
    const nextCart = normalizeCart({ ...cart, items: nextItems }, userName)

    await persistCart(nextCart, 'Producto eliminado del carrito.')
  }

  const clearBasket = async () => {
    if (actionLockRef.current) {
      return
    }

    actionLockRef.current = true
    setIsSaving(true)
    setError('')

    try {
      await deleteBasket(userName)

      if (isMountedRef.current) {
        setCart(createEmptyCart(userName))
        showNotification('Carrito vaciado correctamente.')
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message)
        showNotification(err.message, 'error')
      }
    } finally {
      actionLockRef.current = false

      if (isMountedRef.current) {
        setIsSaving(false)
      }
    }
  }

  const changeUserName = (nextUserName) => {
    const normalizedUserName = nextUserName.trim()

    if (!normalizedUserName || normalizedUserName === userName) {
      return
    }

    window.localStorage.setItem(BASKET_USER_STORAGE_KEY, normalizedUserName)
    setCart(createEmptyCart(normalizedUserName))
    setError('')
    setNotification(null)
    setUserName(normalizedUserName)
  }

  const totalItems = cart.items.reduce((total, item) => total + Number(item.quantity), 0)

  return (
    <BasketContext.Provider
      value={{
        cart,
        userName,
        isLoading,
        isSaving,
        error,
        notification,
        addProduct,
        increaseQuantity,
        decreaseQuantity,
        removeProduct,
        clearBasket,
        changeUserName,
        refreshBasket,
        totalItems,
      }}
    >
      {children}
    </BasketContext.Provider>
  )
}
