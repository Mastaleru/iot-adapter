const _ = require('lodash');
const axios = require('axios');

class DbStorage {
  constructor(config) {
    this.client = axios.create(config);
    this.normalizeCollectionResponse = function(response) {
      const resources = response.data.results;
      return _.map(resources, function(resource) {
        const _resource = _.omit(resource, [
          'objectId',
          'createdAt',
          'updatedAt',
          'ACL'
        ]);
        _resource.id = resource.objectId;
        return _resource;
      });
    }
    this.normalizeSingleResponse = function(response) {
      const resource = response.data;
      const _resource = _.omit(resource, [
        'objectId',
        'createdAt',
        'updatedAt',
        'ACL'
      ]);
      _resource.id = resource.objectId;
      return _resource;
    }
    this.normalizeErrorResponse = function(error) {
      if(error.response){
        return { status: error.response.status, message: error.response.statusText }
      } else {
        return { status: 500, message: error.message }
      }
    }
  }

  searchResources(type, params, callback) {
    const _self = this;
    this.client
      .get(`/classes/${type}`, { params: params })
      .then((response) => {
        callback(undefined, _self.normalizeCollectionResponse(response));
      })
      .catch((error) => {
        callback(_self.normalizeErrorResponse(error), null);
      });
  }

  async searchResourcesAsync(type, params) {
    try {
      const response = await this.client.get(`/classes/${type}`, { params: params });
      return Promise.resolve(this.normalizeCollectionResponse(response));
    } catch(error) {
      return Promise.reject(this.normalizeErrorResponse(error));
    }
  }

  createResource(type, jsonData, callback) {
   
    const _self = this;
    const resource = _.merge({
      "resourceType": type
    }, jsonData);
    
    this.client
      .post(`/classes/${type}`, resource)
      .then((response) => {
        console.log(response);
        let _resource = _self.normalizeSingleResponse(response);
        _self.getResourceById(type, _resource.id, callback);         
      })
      .catch((error) => {
        console.log(error);
        callback(_self.normalizeErrorResponse(error), null);
      });
  }

  async createResourceAsync(type, jsonData) {
    const _self = this;
    const resource = _.merge({
      "resourceType": type
    }, jsonData);

    try {
      const response = await this.client.post(`/classes/${type}`, resource);
      let _resource = this.normalizeSingleResponse(response);
      return this.getResourceByIdAsync(type, _resource.id);
    } catch(error) {
      return Promise.reject(this.normalizeErrorResponse(error));
    }
  }

  updateResource(type, id, jsonData, callback) {
    const _self = this;
    const resource = _.merge({
      "resourceType": type
    }, jsonData);
    this.client
      .put(`/classes/${type}/${id}`, resource)
      .then((response) => {
        _self.getResourceById(type, id, callback);
        // callback(undefined, _self.normalizeErrorResponse(response))
      })
      .catch((error) => {
        callback(_self.normalizeErrorResponse(error), null);
      });
  }

  getResourceById(type, id, callback) {
    const _self = this;
    this.client
      .get(`/classes/${type}/${id}`)
      .then((response) => {
        callback(undefined, _self.normalizeSingleResponse(response));
      })
      .catch((error) => {
        callback(_self.normalizeErrorResponse(error), null);
      });
  }
  getResourceBySk(type, id, callback) {
    const _self = this;
    
    this.client
      .get(`/classes/${type}?where={"meta.sk": ${id}}`)
      .then((response) => {
        callback(undefined, _self.normalizeCollectionResponse(response));
      })
      .catch((error) => {
        callback(_self.normalizeErrorResponse(error), null);
      });
  }


  async getResourceByIdAsync(type, id) {
    try {
      const response = await this.client.get(`/classes/${type}/${id}`);
      return Promise.resolve(this.normalizeSingleResponse(response));
    } catch(error) {
      return Promise.reject(this.normalizeErrorResponse(error));
    }
  }

  deleteResource(type, id, callback) {
    const _self = this;
    this.client
      .delete(`/classes/${type}/${id}`)
      .then((response) => {
        callback(undefined, {});
      })
      .catch((error) => {
        callback(_self.normalizeErrorResponse(error), null);
      });
  }

  findOrCreateResource(type, jsonData, params, callback) {
    const _self = this;
    _self.searchResources(type, params, function(error, resources){
      if(error){
        callback(error, null);
      } else {
        if (resources && resources.length > 0) {
          callback(undefined, resources[0]);
        } else {
          _self.createResource(type, jsonData, callback);
        }
      }
    });
  }

  async findOrCreateResourceAsync(type, jsonData, params) {
    try {
      const resource = await this.findResourceAsync(type, params);
      if (resource) {
        return Promise.resolve(resource);
      } else {
        return this.createResourceAsync(type, jsonData);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  findResource(type, params, callback) {
    const _self = this;
    _self.searchResources(type, params, function(error, resources){
      if(error){
        callback(error, null);
      } else {
        if (resources && resources.length > 0) {
          callback(undefined, resources[0]);
        } else {
          callback(undefined, null);
        }
      }
    });
  }

  async findResourceAsync(type, params) {
    try {
      const resources = await this.searchResourcesAsync(type, params);
      return Promise.resolve(resources[0]);
    } catch(error) {
      return Promise.reject(error);
    }
  }

  getObservationByPatientId(type, id, callback) {
    const _self = this;

    this.client
      .get(`/classes/${type}?where={"sk":{"$text":{"$search":{"$term":${id}}}}}`)
      .then((response) => {
        callback(undefined, _self.normalizeSingleResponse(response));
      })
      .catch((error) => {
        callback(_self.normalizeErrorResponse(error), null);
      });
  }
  getObservationsByPatientDID(type, did, callback) {
    const _self = this;
    let ref = "Patient/"+did;
    this.client
      .get(`/classes/${type}?where={"sk":{"$text":{"$search":{"$term":${ref}}}}}`)
      .then((response) => {
        callback(undefined, _self.normalizeSingleResponse(response));
      })
      .catch((error) => {
        callback(_self.normalizeErrorResponse(error), null);
      });
  }
  getAllObservations(type, did, callback) {
    const _self = this;
    this.client
      .get(`/classes/Observation?where={"sk":{"$text":{"$search":{"$term":"patient/6VHBJrEp4s"}}}}`)
      .then((response) => {
        callback(undefined, _self.normalizeSingleResponse(response));
      })
      .catch((error) => {
        callback(_self.normalizeErrorResponse(error), null);
      });
  }
}

module.exports = DbStorage;
