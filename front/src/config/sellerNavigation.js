const sellerNavigation = [
    {
      path: "/seller/dashboard",
      label: "Dashboard",
      iconClass: "bi bi-bar-chart-line-fill",
      exact: true,
    },
    {
      path: "/seller/products",
      label: "Products",
      iconClass: "bi bi-bag-fill",
      subItems: [
        { path: "/seller/products/list", label: "All Products" },
        { path: "/seller/products/add", label: "Add New" },
      ],
    },
    {
      path: "/seller/orders",
      label: "Orders",
      iconClass: "bi bi-box-seam",
    },
    {
      path: "/seller/reviews",
      label: "Reviews",
      iconClass: "bi bi-star-fill",
    }
  ];
  
  export default sellerNavigation;