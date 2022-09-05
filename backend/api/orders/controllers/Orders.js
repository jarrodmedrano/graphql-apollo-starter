'use strict';

/**
 * Order.js controller
 *
 * @description: A set of functions called "actions" for managing `Order`.
 */
// note that this needs to be a "private" key from STRIPE
const stripe = require('stripe')('sk_test_zovhWaIqvhMYG3FuONCe2M6c');
module.exports = {
  /**
   * Create a/an order record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    if (
      !ctx.state &&
      ctx.request &&
      ctx.request.header &&
      ctx.request.header.authorization
    ) {
      const { id } = await strapi.plugins[
        'users-permissions'
      ].services.jwt.getToken(ctx);
      ctx.state.user = await strapi.plugins[
        'users-permissions'
      ].services.user.fetchAuthenticatedUser(id);

      console.log('the id', id);
    }

    const { address, amount, dishes, token, city, state } = JSON.parse(
      ctx.request.body
    );
    const { user } = ctx.state;

    console.log('user', user);

    try {
      const stripeAmount = Math.floor(amount * 100);
      // charge on stripe
      const charge = await stripe.charges.create({
        // Transform cents to dollars.
        amount: stripeAmount,
        currency: 'usd',
        description: `Order ${new Date()} by me`,
        source: token,
      });

      console.log('charge', charge);

      // Register the order in the database
      const order = await strapi.services.orders.create({
        user: 1,
        charge_id: charge?.id,
        amount: stripeAmount,
        address,
        dishes,
        city,
        state,
      });

      console.log('the order', order);

      console.log('@@ method', await ctx.request.body); // ok
      console.log('@@ ctx request', await ctx.request); // ok
      console.log('@@ ctx status', await ctx.status); // always 404

      console.log('@@ ctx status', await ctx.status);

      return order;
    } catch (err) {
      console.log('error', err);
    }
  },
};
