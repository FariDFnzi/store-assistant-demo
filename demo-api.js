const demoCatalog = [
  {title: 'Canvas Tote', price: '18.00', inventory: 24},
  {title: 'Ceramic Mug', price: '14.00', inventory: 12},
  {title: 'Desk Notebook', price: '9.00', inventory: 8}
].map(product => ({...product, currency: 'USD', status: 'ACTIVE'}));

function demoReply(text) {
  if (/\b(draft|create|add|update|change|adjust)\b/i.test(text)) {
    return 'I can preview a draft or price change. For a draft, provide a product name and price. For a price change, provide a product name and the new price. This demo does not apply store changes.';
  }
  if (/\b(orders?|sales|fulfillment)\b/i.test(text)) {
    return 'Sample orders: #1042 was paid and shipped. #1043 was paid and is awaiting fulfillment.';
  }
  if (/\b(store|overview|currency)\b/i.test(text)) {
    return 'Sample Store uses USD. The sample catalog contains 3 active products and 44 units in stock.';
  }
  const matching = demoCatalog.filter(product => text.toLowerCase().includes(product.title.toLowerCase()));
  if (matching.length || /\b(products?|inventory|stock|catalog|prices?)\b/i.test(text)) {
    return (matching.length ? matching : demoCatalog)
      .map(({title, price, inventory}) => title + ' — $' + price + ', ' + inventory + ' in stock.')
      .join('\n');
  }
  return 'Hi! I can show sample products, stock levels, and order statuses. Try “List products” or “Show recent orders.”';
}

async function demoFetch(path, options = {}) {
  const url = new URL(path, location.origin);
  switch (url.pathname) {
    case '/api/connect':
      return Response.json({name: 'Sample Store', currencyCode: 'USD'});
    case '/api/products': {
      const title = (url.searchParams.get('title') || '').trim().toLowerCase();
      return Response.json({
        products: demoCatalog.filter(product => product.title.toLowerCase().includes(title)),
        pageInfo: {endCursor: null, hasNextPage: false}
      });
    }
    case '/api/chat':
    case '/api/agent-chat': {
      const message = JSON.parse(options.body).messages.findLast(item => item.role === 'user');
      return Response.json({reply: demoReply(message?.content || '')});
    }
    default:
      return Response.json({error: 'This action is unavailable in the demo.'}, {status: 404});
  }
}
