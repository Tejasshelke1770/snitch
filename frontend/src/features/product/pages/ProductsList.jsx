import React from 'react'
import useProduct from '../hook/useProduct'

const ProductsList = () => {
    const {handleGetProducts} = useProduct()
  return (
    <div>ProductsList</div>
  )
}

export default ProductsList