const partyRepo = require('../repositories/partyRepository')

exports.getParties = async () => {
  return partyRepo.getAll()
}

exports.getPartyById = async (id) => {
  return partyRepo.getById(id)
}

exports.createParty = async (data) => {
  return partyRepo.insertParty(data)
}

exports.updateParty = async (id, data) => {
  return partyRepo.updateParty(id, data)
}

exports.getPartyLedger = async (partyId) => {
  return partyRepo.getLedger(partyId)
}