const service      = require('./service');
const { sendSuccess } = require('../../common/utils/response.util');

async function start(req, res, next) {
  try {
    const { memberId } = req.body;
    const instance = await service.startBorrowFlow(memberId);
    sendSuccess(res, 201, 'Library borrow flow started.', { instance });
  } catch (err) { next(err); }
}

async function search(req, res, next) {
  try {
    const { instanceId } = req.params;
    const { query, actor } = req.body;
    const result = await service.searchBook(instanceId, query, actor);
    sendSuccess(res, 200, 'Search completed. Flow advanced to checkout.', result);
  } catch (err) { next(err); }
}

async function checkout(req, res, next) {
  try {
    const { instanceId } = req.params;
    const { isbn, actor } = req.body;
    const result = await service.checkoutBook(instanceId, isbn, actor);
    sendSuccess(res, 200, 'Book checked out. Flow advanced to return.', result);
  } catch (err) { next(err); }
}

async function returnBook(req, res, next) {
  try {
    const { instanceId } = req.params;
    const { actor } = req.body;
    const result = await service.returnBook(instanceId, actor);
    sendSuccess(res, 200, 'Book returned. Flow completed.', result);
  } catch (err) { next(err); }
}

async function detail(req, res, next) {
  try {
    const { instanceId } = req.params;
    const result = await service.getInstanceDetail(instanceId);
    sendSuccess(res, 200, 'Instance detail fetched.', result);
  } catch (err) { next(err); }
}

module.exports = { start, search, checkout, returnBook, detail };
