import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function DataTable({ 
  headers, 
  data, 
  onRowClick,
  sortable = false,
  pagination = false,
  itemsPerPage = 10
}) {
  const [sortConfig, setSortConfig] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = [...data];
  if (sortConfig && sortable) {
    sortedData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedData;

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="card data-table-container">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index}
                  onClick={sortable ? () => requestSort(header.key) : null}
                  className={sortable ? 'sortable' : ''}
                >
                  {header.label}
                  {sortConfig?.key === header.key && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? 'clickable-row' : ''}
              >
                {headers.map((header, cellIndex) => (
                  <td key={cellIndex}>
                    {row[header.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="empty-table-message">
          No data available
        </div>
      )}
      
      {pagination && data.length > itemsPerPage && (
        <div className="pagination-controls">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {Math.ceil(data.length / itemsPerPage)}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(data.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

DataTable.propTypes = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func,
  sortable: PropTypes.bool,
  pagination: PropTypes.bool,
  itemsPerPage: PropTypes.number
};