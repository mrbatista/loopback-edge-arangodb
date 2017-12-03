import debug from './debug';

export default (Model, options) => {
  options = Object.assign({_id: '_id', _from: '_from', _to: '_to'}, options);
  debug('Edge mixin for Model %s with options %O', Model.modelName, options);

  Model.defineProperty(options._id, {type: String, _id: true});
  Model.defineProperty(options._from, {
    type: String,
    _from: true,
    required: true,
  });
  Model.defineProperty(options._to, {type: String, _to: true, required: true});
};
