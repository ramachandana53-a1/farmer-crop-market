/**
 * ============================================================================
 * ACADEMIC PROJECT: AGRI MARKET / FARMER-CROP-MARKET SYSTEM
 * MODULE 5: REAL-TIME CHECKOUT & DELIVERY TRACKER MICROSERVICE (NODE.JS / EXPRESS)
 * ============================================================================
 */

/**
 * POST /api/checkout/place-order
 * Handles instant purchase order reservation, initiates 4-stage delivery tracking,
 * and emits real-time WebSocket socket.io events to update Buyer & Farmer UIs.
 */
async function handleCheckout(req, res) {
  const { buyerId, items, paymentInfo } = req.body;

  // 1. Save to Orders Table (makes it visible under "My Orders")
  const newOrder = await Order.create({
    buyerId,
    items,
    status: 'ORDER_PLACED',
    createdAt: new Date()
  });

  // 2. Initialize Delivery Tracking Record immediately
  await DeliveryTracker.create({
    orderId: newOrder._id,
    buyerId,
    status: 'ORDER_PLACED',
    trackingSteps: [
      { step: 'Placed', timestamp: new Date(), completed: true },
      { step: 'Accepted', completed: false },
      { step: 'Out for Delivery', completed: false },
      { step: 'Delivered', completed: false }
    ]
  });

  // 3. Emit real-time event to update Buyer UI without page reload
  io.to(buyerId).emit('ORDER_CREATED', newOrder);

  res.status(200).json({ success: true, orderId: newOrder._id });
}

/**
 * Authentication middleware helper
 */
function authenticateUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  next();
}

/**
 * Example Node.js / Express backend middleware check
 * PATCH /api/orders/:id/status
 * Enforces role isolation: Buyers cannot manually update order statuses.
 */
function setupOrderRoutes(app) {
  app.post('/api/checkout/place-order', handleCheckout);

  app.patch('/api/orders/:id/status', authenticateUser, (req, res) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SELLER' && req.user.role !== 'FARMER') {
      return res.status(403).json({ error: 'Unauthorized: Buyers cannot manually update order statuses.' });
    }
    // Proceed with status update logic...
    const { status } = req.body;
    res.json({ success: true, orderId: req.params.id, status, updatedAt: new Date() });
  });
}

module.exports = {
  handleCheckout,
  authenticateUser,
  setupOrderRoutes
};
