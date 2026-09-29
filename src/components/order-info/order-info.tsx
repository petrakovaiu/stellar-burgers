import { Preloader, OrderInfoUI } from '@ui';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import type { TIngredient } from '@utils-types';
import { getOrderByNumber } from '../../services/orderSlice';
import { useDispatch, useSelector } from '../../services/store';

export const OrderInfo = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const orderNumber = Number(number);

  const ingredients = useSelector((state) => state.ingredients.ingredients);
  const feedOrder = useSelector((state) =>
    state.feed.orders.find((order) => order.number === orderNumber)
  );
  const profileOrder = useSelector((state) =>
    state.feed.profileOrders.find((order) => order.number === orderNumber)
  );
  const currentOrder = useSelector((state) => state.order.currentOrder);

  const orderData =
    feedOrder ??
    profileOrder ??
    (currentOrder?.number === orderNumber ? currentOrder : null);

  useEffect(() => {
    if (!orderData && Number.isFinite(orderNumber)) {
      void dispatch(getOrderByNumber(orderNumber));
    }
  }, [dispatch, orderData, orderNumber]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
