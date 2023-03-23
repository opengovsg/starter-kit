import wretch from 'wretch';
import FormDataAddon from 'wretch/addons/formData';
import QueryStringAddon from 'wretch/addons/queryString';

export const api = wretch().addon(FormDataAddon).addon(QueryStringAddon);
