import { SharedCollectionState } from './shared-collection.machine';
import { createSelector } from 'reselect';
import { ActorID, ActorType } from './types';
import { getActorType } from './helpers';
import { AnyActorRef } from 'xstate';

const selectSharedCollectionContext = (state: SharedCollectionState) =>
  state.context;

export const selectActorRefs = createSelector(
  selectSharedCollectionContext,
  (context) => context.actorRefs
);

export const selectActorsInitialized = (state: SharedCollectionState) =>
  state.matches('Actors.Initialized');

export function createActorByTypeSelector<TActor extends AnyActorRef>(actorType: ActorType) {
  return createSelector(
    selectActorRefs,
    (actors) =>
      Object.entries(actors)
        .filter(([actorId]) => getActorType(actorId) === actorType)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .map(([_, actor]) => actor) as TActor[]
  );
}

export function createActorByIdSelector<T extends AnyActorRef>(
  actorId: ActorID
) {
  return createSelector(
    selectActorRefs,
    (actors) => actors[actorId] as T | undefined
  );
}
