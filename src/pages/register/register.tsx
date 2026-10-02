import { RegisterUI } from '@ui-pages';
import { type SyntheticEvent, useState } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';

import { useDispatch, useSelector } from '../../services/store';
import { registerUser } from '../../services/userSlice';

type TLocationState = {
  from?: Location;
};

export const Register = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const error = useSelector((state) => state.user.error);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    void dispatch(registerUser({ name: userName, email, password }))
      .unwrap()
      .then(() => {
        const state = location.state as TLocationState | null;
        const from = state?.from;
        const destination = from ? `${from.pathname}${from.search}${from.hash}` : '/';

        void navigate(destination, { replace: true });
      })
      .catch(() => undefined);
  };

  return (
    <RegisterUI
      errorText={error?.message}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
