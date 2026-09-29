import { ProfileOrdersUI } from '@ui-pages';
import { Preloader } from '@ui';
import { useEffect } from 'react';

import { getProfileOrders } from '../../services/feedSlice';
import { useDispatch, useSelector } from '../../services/store';

export const ProfileOrders = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.feed.profileOrders);
  const isLoading = useSelector((state) => state.feed.profileOrdersLoading);

  useEffect(() => {
    void dispatch(getProfileOrders());
  }, [dispatch]);

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={orders} />;
};
