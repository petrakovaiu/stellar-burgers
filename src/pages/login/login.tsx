import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useState } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';

import { loginUser } from '../../services/userSlice';
import { useDispatch, useSelector } from '../../services/store';

type TLocationState = {
  from?: Location;
};

export const Login = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const error = useSelector((state) => state.user.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    void dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        const state = location.state as TLocationState | null;
        const from = state?.from;
        const destination = from
          ? `${from.pathname}${from.search}${from.hash}`
          : '/';

        void navigate(destination, { replace: true });
      })
      .catch(() => undefined);
  };

  return (
    <LoginUI
      errorText={error?.message}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
