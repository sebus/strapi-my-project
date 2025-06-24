"use strict";

/**
 * ticket controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

//module.exports = createCoreController("api::ticket.ticket");

module.exports = createCoreController("api::ticket.ticket", ({ strapi }) => ({
  async create(ctx) {
    try {
      // Nous allons placer le code étendu de notre route ici
      // Nous créons une constante pour récupérer les valeurs du body de la requete
      const body = ctx.request.body;
      // Nous créons une constante pour récupérer l'ID de l'évènement associé
      const eventId = body.data.event;
      // Nous stockons dans une variable la soirée dont l'id est celui reçu dans le body
      const event = await strapi.entityService.findOne(
        "api::event.event",
        eventId
      );
      //
      const placesWanted = body.data.seats;
      const catWanted = body.data.category;
      // On vient tester s'il reste suffisament de place dans la category concernée
      // Il faut donc aller chercher le nombre de place de la category dans l'objet seats
      const placesAvalaible = event.seats[catWanted];

      if (placesWanted > placesAvalaible) {
        // Si le nombre de place souhaitée est supérieure au nombre de place restante : erreur
        return ctx.badRequest("Il n'y a plus assez de places !");
      }
      // On retrouve ici le comportement normal de la route
      const { data, meta } = await super.create(ctx);

      // On créé une constante avec l'objet de event seats // "seats": { "orchestre": 20, "mezzanine": 10 }
      const newSeats = event.seats;
      // décrémente la valeur de l'objet selon la clé (orchestre ou mezzanine)
      newSeats[catWanted] -= placesWanted;

      await strapi.entityService.update("api::event.event", eventId, {
        data: {
          seats: newSeats, // On renvoie l'objet en valeur
        },
      });

      // On peut répoondre au client
      return { meta, data };
    } catch (error) {
      // Si une erreur survient, nous passons dans le catch et la récupérons sous le nom de error
      // La réponse que nous renvoyons au client aura un statut 500
      ctx.response.status = 500;
      // Nous renvoyons au client un objet avec une clef message qui contient le message d'erreur
      return { message: error.message };
    }
  },
}));
