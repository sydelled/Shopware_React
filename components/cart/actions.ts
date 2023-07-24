'use server';

import { ApiClientError } from '@shopware/api-client';
import { getApiClient } from 'lib/shopware/api';
import { ExtendedCart, ExtendedLineItem } from 'lib/shopware/api-extended';
import { cookies } from 'next/headers';

export const fetchCart = async function (cartId?: string): Promise<ExtendedCart | undefined> {
  try {
    const apiClient = getApiClient(cartId);
    const cart = await apiClient.invoke('readCart get /checkout/cart?name', {});

    return cart;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error);
      console.error('Details:', error.details);
    } else {
      console.error('==>', error);
    }
  }
};

export const addItem = async (variantId: string | undefined): Promise<Error | undefined> => {
  const cartId = cookies().get('sw-context-token')?.value;

  if (!variantId) {
    return new Error('Missing variantId');
  }

  try {
    let quantity = 1;
    const apiClient = getApiClient(cartId);

    // this part allows us to click multiple times on addToCart and increase the qty with that
    const cart = await fetchCart(cartId);
    const itemInCart = cart?.lineItems?.filter((item) => item.id === variantId) as
      | ExtendedLineItem
      | undefined;
    if (itemInCart && itemInCart.quantity) {
      quantity = itemInCart.quantity + 1;
    }

    apiClient.invoke('addLineItem post /checkout/cart/line-item', {
      items: [
        {
          id: variantId,
          quantity: quantity,
          referencedId: variantId,
          type: 'product'
        }
      ]
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error);
      console.error('Details:', error.details);
    } else {
      console.error('==>', error);
    }
  }
};

export const removeItem = async (lineId: string): Promise<Error | undefined> => {
  const cartId = cookies().get('sw-context-token')?.value;

  if (!cartId) {
    return new Error('Missing cartId');
  }

  try {
    const apiClient = getApiClient(cartId);
    await apiClient.invoke('deleteLineItem delete /checkout/cart/line-item?id[]={ids}', {
      ids: [lineId]
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error);
      console.error('Details:', error.details);
    } else {
      console.error('==>', error);
    }
  }
};

export const updateItemQuantity = async ({
  lineId,
  variantId,
  quantity
}: {
  lineId: string;
  variantId: string;
  quantity: number;
}): Promise<Error | undefined> => {
  const cartId = cookies().get('sw-context-token')?.value;

  if (!cartId) {
    return new Error('Missing cartId');
  }

  try {
    const apiClient = getApiClient(cartId);
    await apiClient.invoke('updateLineItem patch /checkout/cart/line-item', {
      items: [
        {
          id: lineId,
          referencedId: variantId,
          quantity: quantity
        }
      ]
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error);
      console.error('Details:', error.details);
    } else {
      console.error('==>', error);
    }
  }
};
