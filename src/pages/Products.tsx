import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { Product, getActiveProducts, getProductById } from '../utils/productService';
import { formatCurrency } from '../utils/currencyFormatter';
import { processPayment } from '../services/razorpayService';
import { getCurrentUser } from '../utils/localStorageService';
import { toast } from 'react-hot-toast';
import PaymentSuccess from '../components/PaymentSuccess';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    show: boolean;
    productName: string;
    transactionId: string;
    amount: number;
    date: string;
  }>({
    show: false,
    productName: '',
    transactionId: '',
    amount: 0,
    date: ''
  });

  useEffect(() => {
    // Fetch products from local storage using our service
    const fetchProducts = () => {
      setLoading(true);
      
      // Simulating API call with a slight delay
      setTimeout(() => {
        const activeProducts = getActiveProducts();
        setProducts(activeProducts);
        setLoading(false);
      }, 500);
    };

    fetchProducts();
    
    // Setup window event listener for payment success from Razorpay
    const handleRazorpayEvent = (event: any) => {
      if (event.detail && event.detail.productId) {
        handlePaymentSuccess(
          event.detail.paymentId,
          event.detail.productId
        );
      }
    };
    
    window.addEventListener('razorpay-payment-success', handleRazorpayEvent);
    
    return () => {
      window.removeEventListener('razorpay-payment-success', handleRazorpayEvent);
    };
  }, []);

  const handlePurchase = async (product: Product) => {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
      toast.error('Please login to purchase products');
      return;
    }

    try {
      setProcessingPayment(true);
      setSelectedProductId(product.id);
      
      // Initialize Razorpay payment
      const paymentStarted = await processPayment(product);
      
      if (!paymentStarted) {
        toast.error('Failed to initialize payment. Please try again.');
        setProcessingPayment(false);
        setSelectedProductId(null);
      }
      
      // We don't reset processing state here because it will be handled by the
      // payment success/cancel callbacks in the Razorpay handler
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setProcessingPayment(false);
      setSelectedProductId(null);
    }
  };

  // Handle payment callback from Razorpay
  const handlePaymentSuccess = (
    paymentId: string,
    productId: string
  ) => {
    // Reset processing state
    setProcessingPayment(false);
    setSelectedProductId(null);
    
    if (paymentId && productId) {
      // Get the product details
      const product = getProductById(productId);
      if (product) {
        // Show payment success modal
        setPaymentSuccess({
          show: true,
          productName: product.name,
          transactionId: paymentId,
          amount: product.price,
          date: new Date().toISOString()
        });
      } else {
        toast.success('Payment successful! Your purchase is complete.');
      }
    }
  };
  
  const dismissPaymentSuccess = () => {
    setPaymentSuccess(prev => ({ ...prev, show: false }));
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Our Products</h1>
        <p className="text-neutral-600">Explore our range of health and wellness products</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-neutral-600">Loading products...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="h-full flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-center h-48 bg-neutral-100 rounded-t-lg mb-4">
                  <Package className="h-24 w-24 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">{product.name}</h3>
                <div className="text-2xl font-bold text-primary-600 mb-4">
                  {formatCurrency(product.price)}
                </div>
                <p className="text-neutral-600 mb-4">
                  {product.description}
                </p>
                <div className="text-sm text-neutral-500 mb-2">
                  <span className="font-semibold">Affiliate Commission:</span> {product.commissionRate}%
                </div>
              </div>
              <Button
                variant="primary"
                fullWidth
                leftIcon={processingPayment && selectedProductId === product.id ? 
                  <div className="animate-spin mr-2">⭘</div> : 
                  <ShoppingCart className="h-4 w-4" />
                }
                onClick={() => handlePurchase(product)}
                disabled={processingPayment}
                className="mt-4"
              >
                {processingPayment && selectedProductId === product.id ? 
                  'Processing...' : 'Purchase Now'}
              </Button>
            </Card>
          ))}

          {products.length === 0 && (
            <div className="col-span-full text-center py-12 text-neutral-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
              <p>No products available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Payment Success Modal */}
      {paymentSuccess.show && (
        <PaymentSuccess
          productName={paymentSuccess.productName}
          transactionId={paymentSuccess.transactionId}
          amount={paymentSuccess.amount}
          date={paymentSuccess.date}
          onDismiss={dismissPaymentSuccess}
        />
      )}
    </MainLayout>
  );
};

export default Products; 