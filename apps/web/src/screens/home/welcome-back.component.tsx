import { useSelector } from '@xstate/react';
import { useContext } from 'react';
import { selectPlayerName } from '~/web/state/auth.selectors';
import { GlobalStateContext } from '~/web/state/global.provider';
import { Container } from '../club/club.styles';

export const WelcomeBack = () => {
  const { authActor } = useContext(GlobalStateContext);
  const playerName = useSelector(authActor, selectPlayerName);

  return <Container>Welcome back, {playerName}</Container>;
};