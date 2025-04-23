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
      badge: 5,
    },
    {
      path: "/seller/sales-report",
      label: "Sales Report",
      iconClass: "bi bi-graph-up",
    },
    {
      path: "/seller/payouts",
      label: "Payouts",
      iconClass: "bi bi-credit-card-2-back-fill",
    },
    {
      path: "/seller/reviews",
      label: "Reviews",
      iconClass: "bi bi-star-fill",
      badge: 12,
    },
    {
      path: "/seller/inbox",
      label: "Inbox",
      iconClass: "bi bi-envelope-fill",
      badge: 3,
    },
    {
      path: "/seller/store-settings",
      label: "Store Settings",
      iconClass: "bi bi-gear-fill",
    },
  ];
  
  export default sellerNavigation;
  