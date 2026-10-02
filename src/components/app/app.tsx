import {
  AppHeader,
  IngredientDetails,
  Modal,
  OrderInfo,
  ProtectedRoute,
} from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { Preloader } from '@ui';
import { useEffect } from 'react';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  type Location,
} from 'react-router-dom';

import { getIngredients } from '../../services/ingredientsSlice';
import { useDispatch, useSelector } from '../../services/store';
import { checkUserAuth } from '../../services/userSlice';

import type { AppContentProps } from './type';

import '../../index.css';

import styles from './app.module.css';

type TLocationState = {
  background?: Location;
};

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const ingredients = useSelector((state) => state.ingredients.ingredients);
  const isIngredientsLoading = useSelector((state) => state.ingredients.isLoading);
  const ingredientsError = useSelector((state) => state.ingredients.error);

  useEffect(() => {
    void dispatch(getIngredients());
    void dispatch(checkUserAuth());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        ingredients={ingredients}
        isLoading={isIngredientsLoading}
        error={ingredientsError}
      />
    </div>
  );
};

export default App;

const AppContent = ({
  ingredients,
  isLoading,
  error,
}: AppContentProps): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  if (!ingredients.length) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>Нет ингредиентов</p>
    );
  }

  return <RouteComponent />;
};

const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as TLocationState | null;
  const background = locationState?.background;

  const closeModal = (): void => {
    void navigate(-1);
  };

  return (
    <>
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/:number" element={<OrderDetailsPage />} />
        <Route path="/ingredients/:id" element={<IngredientDetailsPage />} />

        <Route
          path="/login"
          element={
            <ProtectedRoute onlyUnAuth>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute onlyUnAuth>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute onlyUnAuth>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/orders/:number"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={closeModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route path="/feed/:number" element={<OrderModal onClose={closeModal} />} />
          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute>
                <OrderModal onClose={closeModal} />
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </>
  );
};

const IngredientDetailsPage = (): React.JSX.Element => (
  <main className={styles.detailPageWrap}>
    <h1 className={`${styles.detailHeader} text text_type_main-large`}>
      Детали ингредиента
    </h1>
    <IngredientDetails />
  </main>
);

const OrderDetailsPage = (): React.JSX.Element => {
  const { number } = useParams();

  return (
    <main className={styles.detailPageWrap}>
      <h1 className={`${styles.detailHeader} text text_type_digits-default`}>
        #{String(number ?? '').padStart(6, '0')}
      </h1>
      <OrderInfo />
    </main>
  );
};

const OrderModal = ({ onClose }: { onClose: () => void }): React.JSX.Element => {
  const { number } = useParams();

  return (
    <Modal title={`#${String(number ?? '').padStart(6, '0')}`} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};
