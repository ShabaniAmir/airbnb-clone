"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addConstraint("Bookings", {
      fields: ["spotId", "startDate"],
      type: "unique",
      name: "unique_booking_spotId_startDate",
    });
    await queryInterface.addConstraint("Bookings", {
      fields: ["spotId", "endDate"],
      type: "unique",
      name: "unique_booking_spotId_endDate",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint(
      "Bookings",
      "unique_booking_spotId_startDate"
    );
    await queryInterface.removeConstraint(
      "Bookings",
      "unique_booking_spotId_endDate"
    );
  },
};
