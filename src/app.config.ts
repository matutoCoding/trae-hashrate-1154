export default defineAppConfig({
  pages: [
    'pages/queue/index',
    'pages/priority/index',
    'pages/allowance/index',
    'pages/records/index',
    'pages/take-number/index',
    'pages/order-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FF6B35',
    navigationBarTitleText: '美食广场',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FFF7F2'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/queue/index',
        text: '排队叫号'
      },
      {
        pagePath: 'pages/priority/index',
        text: '优先插队'
      },
      {
        pagePath: 'pages/allowance/index',
        text: '额度管控'
      },
      {
        pagePath: 'pages/records/index',
        text: '消费明细'
      }
    ]
  }
})
