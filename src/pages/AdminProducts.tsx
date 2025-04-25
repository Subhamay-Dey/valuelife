import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash, Plus, X, Save } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { 
  Product, 
  getAllProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct 
} from '../utils/productService';
import { formatCurrency } from '../utils/currencyFormatter';

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'createdDate'>>({
    name: '',
    price: 0,
    description: '',
    commissionRate: 10,
    active: true,
  });

  // Check for admin authentication
  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const allProducts = getAllProducts();
    setProducts(allProducts);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      const updated = updateProduct(editingProduct);
      if (updated) {
        loadProducts();
        setEditingProduct(null);
      }
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const isDeleted = deleteProduct(productId);
      if (isDeleted) {
        loadProducts();
      }
    }
  };

  const handleAddProduct = () => {
    const addedProduct = addProduct(newProduct);
    if (addedProduct) {
      loadProducts();
      setShowAddForm(false);
      setNewProduct({
        name: '',
        price: 0,
        description: '',
        commissionRate: 10,
        active: true,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Product Management</h1>
          <p className="text-neutral-600">Manage products and their commission rates</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAddForm(true)}
        >
          Add Product
        </Button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Add New Product</h2>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<X className="h-4 w-4" />}
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              placeholder="Enter product name"
              required
            />
            
            <Input
              label="Price ($)"
              type="number"
              min="0"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
              placeholder="Enter price"
              required
            />
            
            <div className="md:col-span-2">
              <Input
                label="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Enter product description"
              />
            </div>
            
            <Input
              label="Commission Rate (%)"
              type="number"
              min="0"
              max="100"
              value={newProduct.commissionRate}
              onChange={(e) => setNewProduct({...newProduct, commissionRate: parseFloat(e.target.value)})}
              placeholder="Enter commission rate"
              required
            />
            
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="active"
                checked={newProduct.active}
                onChange={(e) => setNewProduct({...newProduct, active: e.target.checked})}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="active" className="ml-2 text-sm font-medium text-neutral-700">
                Active Product
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
          </div>
        </Card>
      )}

      {/* Products List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {products.map((product) => (
                <tr key={product.id}>
                  {editingProduct && editingProduct.id === product.id ? (
                    // Editing mode
                    <>
                      <td className="px-6 py-4">
                        <Input
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                          className="mb-0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                          className="mb-0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editingProduct.commissionRate}
                          onChange={(e) => setEditingProduct({...editingProduct, commissionRate: parseFloat(e.target.value)})}
                          className="mb-0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingProduct.active}
                            onChange={(e) => setEditingProduct({...editingProduct, active: e.target.checked})}
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <label className="ml-2 text-sm font-medium text-neutral-700">
                            Active
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {formatDate(editingProduct.createdDate)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Save className="h-4 w-4" />}
                            onClick={handleUpdateProduct}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<X className="h-4 w-4" />}
                            onClick={() => setEditingProduct(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View mode
                    <>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-900">{product.name}</div>
                        <div className="text-xs text-neutral-500 max-w-xs truncate">{product.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {product.commissionRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${product.active ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-800'}`}
                        >
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        {formatDate(product.createdDate)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Edit className="h-4 w-4" />}
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash className="h-4 w-4" />}
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default AdminProducts; 