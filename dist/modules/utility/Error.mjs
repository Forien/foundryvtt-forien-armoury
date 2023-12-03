import {constants} from '../constants.mjs';
import Utility from './Utility.mjs';

export default class WorkshopError extends Error {
  constructor(error) {
    error = `${constants.moduleLabel} | ${error}`;
    Utility.notify(error, {type: 'error'})
    super(error);
  }
}