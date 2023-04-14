import {
  ConnectionInitializeInputSchema,
  InitializedConnectionEntity,
} from '@explorers-club/schema';
import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../../trpc';
import { waitFor } from '../../utils';

export const connectionRouter = router({
  heartbeat: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.connectionEntity.send({
      type: 'HEARTBEAT',
    });
  }),

  navigate: protectedProcedure
    .input(z.object({ location: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      ctx.connectionEntity.send({
        type: 'NAVIGATE',
        location: input.location,
      });
    }),

  initialize: publicProcedure
    .input(ConnectionInitializeInputSchema)
    .mutation(async ({ ctx, input }) => {
      ctx.connectionEntity.send({
        type: 'INITIALIZE',
        ...input,
      });

      const entity = await waitFor(ctx.connectionEntity, (entity) => {
        console.log(entity.states);
        return entity.states.Initialized === 'True';
      });

      const { authTokens, deviceId } = entity.context;

      return {
        deviceId,
        authTokens,
      };
    }),
});
