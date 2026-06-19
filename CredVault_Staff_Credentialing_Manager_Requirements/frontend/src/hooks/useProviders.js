import { useState, useEffect, useCallback } from 'react';
import { providerService } from '../services/providerService';

export const useProviders = (initialPage = 1, initialLimit = 20) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    status: ''
  });

  const fetchProviders = useCallback(async (page, limit, filterParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await providerService.getProviders({
        page,
        limit,
        ...filterParams
      });
      setProviders(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders(pagination.page, pagination.limit, filters);
  }, [pagination.page, pagination.limit, filters, fetchProviders]);

  const createProvider = useCallback(async (data) => {
    try {
      const result = await providerService.createProvider(data);
      await fetchProviders(1, pagination.limit, filters);
      return result;
    } catch (err) {
      throw err;
    }
  }, [fetchProviders, pagination.limit, filters]);

  const updateProvider = useCallback(async (id, data) => {
    try {
      const result = await providerService.updateProvider(id, data);
      await fetchProviders(pagination.page, pagination.limit, filters);
      return result;
    } catch (err) {
      throw err;
    }
  }, [fetchProviders, pagination.page, pagination.limit, filters]);

  const deleteProvider = useCallback(async (id) => {
    try {
      const result = await providerService.deleteProvider(id);
      await fetchProviders(pagination.page, pagination.limit, filters);
      return result;
    } catch (err) {
      throw err;
    }
  }, [fetchProviders, pagination.page, pagination.limit, filters]);

  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setSearchFilter = useCallback((search) => {
    setFilters(prev => ({ ...prev, search }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setSpecialtyFilter = useCallback((specialty) => {
    setFilters(prev => ({ ...prev, specialty }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setStatusFilter = useCallback((status) => {
    setFilters(prev => ({ ...prev, status }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    providers,
    loading,
    error,
    pagination,
    filters,
    setPage,
    setSearchFilter,
    setSpecialtyFilter,
    setStatusFilter,
    createProvider,
    updateProvider,
    deleteProvider,
    refetch: () => fetchProviders(pagination.page, pagination.limit, filters)
  };
};
