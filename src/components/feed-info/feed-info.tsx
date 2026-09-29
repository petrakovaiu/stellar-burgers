import { FeedInfoUI } from '@ui';

import type { TFeedState, TOrder } from '@utils-types';
import { useSelector } from '../../services/store';

const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo = (): React.JSX.Element => {
  const feedData = useSelector((state) => state.feed);

  const feed: TFeedState = {
    orders: feedData.orders,
    total: feedData.total,
    totalToday: feedData.totalToday,
    isLoading: feedData.isLoading,
    error: feedData.error,
  };

  const readyOrders = getOrders(feed.orders, 'done');
  const pendingOrders = getOrders(feed.orders, 'pending');

  return (
    <FeedInfoUI readyOrders={readyOrders} pendingOrders={pendingOrders} feed={feed} />
  );
};
