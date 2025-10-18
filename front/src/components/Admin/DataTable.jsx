import React, { useState, useEffect } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

const DataTable = ({ 
  title, 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  searchable = true,
  pagination = true,
  itemsPerPageOptions = [5, 10, 25, 50]
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767.98);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Filter data based on search term
  const filteredData = (data || []).filter(item => {
    if (!searchTerm) return true;
    
    return columns.some(column => {
      const value = item[column.field];
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue > bValue ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="card p-1">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        
        {searchable && (
          <div className="card-tools">
            <div className="input-group input-group-sm" style={{ width: '150px' }}>
              <input
                type="text"
                name="table_search"
                className="form-control float-right"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="input-group-append">
                <button type="submit" className="btn btn-default">
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="card-body table-responsive p-0">
        <table className="table table-hover text-nowrap">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.field} 
                  onClick={() => column.sortable !== false && handleSort(column.field)}
                  style={{ cursor: column.sortable !== false ? 'pointer' : 'default' }}
                >
                  {column.header}
                  {column.sortable !== false && (
                    <span className="ml-1">
                      {getSortIcon(column.field)}
                    </span>
                  )}
                </th>
              ))}
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={item.id || index}>
                  {columns.map((column) => (
                    <td key={column.field}>
                      {column.render ? column.render(item) : item[column.field]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td>
                      {onEdit && (
                        <button 
                          className="btn btn-sm btn-info mr-1" 
                          onClick={() => onEdit(item)}
                        >
                          <FaEdit />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => onDelete(item)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && totalPages > 1 && (
        <div className="card-footer clearfix">
          <div className={`${isMobile ? 'text-center' : 'float-left'}`}>
            <select 
              className="form-control form-control-sm d-inline-block" 
              style={{ width: 'auto' }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>
          </div>
          
          <ul className={`pagination pagination-sm m-0 ${isMobile ? 'justify-content-center mt-2' : 'float-right'}`}>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <a 
                className="page-link" 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
              >
                &laquo;
              </a>
            </li>
            
            {/* Show fewer page numbers on mobile */}
            {isMobile ? (
              <>
                {currentPage > 2 && (
                  <li className="page-item">
                    <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}>
                      1
                    </a>
                  </li>
                )}
                {currentPage > 3 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                
                {currentPage > 1 && (
                  <li className="page-item">
                    <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(currentPage - 1); }}>
                      {currentPage - 1}
                    </a>
                  </li>
                )}
                
                <li className="page-item active">
                  <span className="page-link">{currentPage}</span>
                </li>
                
                {currentPage < totalPages && (
                  <li className="page-item">
                    <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(currentPage + 1); }}>
                      {currentPage + 1}
                    </a>
                  </li>
                )}
                
                {currentPage < totalPages - 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                {currentPage < totalPages - 1 && (
                  <li className="page-item">
                    <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages); }}>
                      {totalPages}
                    </a>
                  </li>
                )}
              </>
            ) : (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <a 
                    className="page-link" 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </a>
                </li>
              ))
            )}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <a 
                className="page-link" 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
              >
                &raquo;
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DataTable;
