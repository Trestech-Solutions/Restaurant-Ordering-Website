export interface CheckoutFormValues {
  title: string
  guestFullName: string
  guestMobile: string
  guestAltMobile: string
  guestAddress: string
  guestLandmark: string
  guestEmail: string
  instructions: string
  payment: 'cod' | 'online'
  changeAmount: string
  voucher: string
  isGift: boolean
  selectedAddressId: string
  newAddrLine: string
  newAddrCity: string
}
