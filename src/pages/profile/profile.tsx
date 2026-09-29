import { ProfileUI } from '@ui-pages';
import { type SyntheticEvent, useEffect, useState } from 'react';

import type { TRegisterData } from '@api';
import { updateUser } from '../../services/userSlice';
import { useDispatch, useSelector } from '../../services/store';

export const Profile = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const updateUserError = useSelector((state) => state.user.updateUserError);

  const [formValue, setFormValue] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  });

  useEffect(() => {
    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
  }, [user?.name, user?.email]);

  const isFormChanged =
    formValue.name !== (user?.name ?? '') ||
    formValue.email !== (user?.email ?? '') ||
    Boolean(formValue.password);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();

    const changedData: Partial<TRegisterData> = {};

    if (formValue.name !== user?.name) changedData.name = formValue.name;
    if (formValue.email !== user?.email) changedData.email = formValue.email;
    if (formValue.password) changedData.password = formValue.password;

    if (!Object.keys(changedData).length) return;

    void dispatch(updateUser(changedData))
      .unwrap()
      .then(() => {
        setFormValue((currentValue) => ({
          ...currentValue,
          password: '',
        }));
      })
      .catch(() => undefined);
  };

  const handleCancel = (e: SyntheticEvent): void => {
    e.preventDefault();
    setFormValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={updateUserError?.message}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
