
var productContainer = document.querySelector('#product-list');
var loadMoreButton = document.querySelector('.load-more-button');
var url = '/products'; // the URL to fetch the next page of products

function addToCart(proId) {
    $.ajax({
      url: '/add-to-cart/' + proId,
      method: 'GET',
      success: (response) => {
        if (response.blocked) {
          swal.fire({
            icon: "warning",
            title: "User Blocked",
            text: "You are currently blocked from adding items to the cart."
          });
        } else if (response.noStock) {
          swal.fire({
            icon: "warning",
            title: "Oops",
            text: "Product is out of stock."
          }).then(() => {
            location.reload();
          });
        } else if (response.limit) {
          swal.fire({
            icon: "warning",
            title: "Limit Exceeded",
            text: "You have reached your limit."
          });
        } else if (response.status) {
          let count = $('#cart-count').html();
          count = parseInt(count) + 1;
          $("#cart-count").html(count);
          swal.fire({
            icon: "success",
            title: "Item added to cart",
            showConfirmButton: false,
            timer: 1000
          });
        } else {
          swal.fire({
            icon: "warning",
            title: "Login to continue"
          });
        }
      },
      error: (xhr, status, error) => {
        console.log(xhr.responseText);
        swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while adding the item to the cart"
        });
      }
    });
  }
  

function addToCartfromWishlist(proId) {
    $.ajax({
        url: '/add-to-cart-fromWishlist/' + proId,
        method: 'GET',
        success: (response) => {
            if (response.blocked) {
                swal.fire({
                    icon: "warning",
                    title: "User Blocked",
                    text: "You are currently blocked from adding items to the cart."
                });
            } else if (response.noStock) {
                swal.fire({
                    icon: "warning",
                    title: "Oops",
                    text: "Product is out of stock."
                }).then(() => {
                    location.reload();
                });
            } else if (response.limit) {
                swal.fire({
                    icon: "warning",
                    title: "Limit Exceeded",
                    text: "You have reached your limit."
                });
            } else if (response.status) {
                let count = $('#cart-count').html();
                count = parseInt(count) + 1;
                $("#cart-count").html(count);
                swal.fire({
                    icon: "success",
                    title: "Item added to cart",
                    showConfirmButton: false,
                    timer: 1000
                });
            } else {
                swal.fire({
                    icon: "warning",
                    title: "Login to continue"
                });
            }
        },
        error: (xhr, status, error) => {
            console.log(xhr.responseText);
            swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while adding the item to the cart"
            });
        }
    });
}

function addToWishlist(proId) {
    $.ajax({
        url: '/add-to-wishlist/' + proId,
        method: 'GET',
        success: (response) => {
            if (response.status) {
                let count = $('#wishlist-count').html();
                count = parseInt(count) + 1;
                $('#wishlist-count').html(count);
                Swal.fire({
                    icon: "success",
                    title: "Items are Added to the Wishlist",
                    showConfirmButton: false,
                    timer: 1000
                });
            } else {
                let count = $('#wishlist-count').html();
                count = parseInt(count) - 1;
                $('#wishlist-count').html(count);
                document.getElementById(proId).style.backgroundColor = '#FFD333';
                Swal.fire({
                    icon: "success",
                    title: "Item Removed from wishlist",
                    showConfirmButton: false,
                    timer: 1000
                });
                document.getElementById(proId).style.color = "grey";
            }
        },
        error: (xhr, status, error) => {
            console.log(xhr.responseText);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while adding/removing the item to/from the wishlist"
            });
        }
    });
}

function removeWishlist(proID) {
    $.ajax({
        url: '/remove-wishlist/' + proID,
        method: 'DELETE',
        success: (response) => {
            if (response.status) {
                let count = $('#wishlist-count').html();
                count = parseInt(count) + 1;
                $('#wishlist-count').html(count);
                swal.fire({
                    icon: "success",
                    title: "Item deleted from wishlist",
                    showConfirmButton: false,
                    timer: 1000,
                }).then(() => {
                    location.reload();
                });
            }
        },
        error: (xhr, status, error) => {
            console.log(xhr.responseText);
            swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while removing the item from the wishlist"
            });
        }
    });
}

// Other parts of the code...
function deleteAddress(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete ",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Item deleted.',
                'success'
            ).then(() => {
                location.reload()
            })
        } else {
            return false;
        }
    })
}

function selectAddress(name, address, town, district, state, pincode, phone) {
    document.getElementById('name').value = name
    document.getElementById('address').value = address
    document.getElementById('town').value = town
    document.getElementById('district').value = district
    document.getElementById('state').value = state
    document.getElementById('pincode').value = pincode
    document.getElementById('phone').value = phone
}

function editAddress(id, name, address, town, district, state, pincode, phone) {
    document.getElementById('id1').value = id
    document.getElementById('name1').value = name
    document.getElementById('address1').value = address
    document.getElementById('town1').value = town
    document.getElementById('district1').value = district
    document.getElementById('state1').value = state
    document.getElementById('pincode1').value = pincode
    document.getElementById('phone1').value = phone
}


$("#edit-address").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/edit-address',
        method: 'post',
        data: $('#edit-address').serialize(),
        success: (response) => {
            if (response.status) {
                Swal.fire({
                    position: "",
                    icon: "success",
                    title: "Address Edited Successfully",
                    showConfirmButton: true,
                    confirmButtonColor: 'black',
                }).then(() => {
                    location.reload()
                })
            } else {
                location.reload()
            }
        }
    })
})

function couponApply() {
    console.log("entered")
    let couponCode = document.getElementById('coupon').value
    $.ajax({
        url: '/coupon-apply',
        data: {
            coupon: couponCode,
        },
        method: 'post',
        success: (response) => {
            if (response.couponSuccess) {
                console.log(response, "respones")
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Coupon Applied Successfully",
                    showConfirmButton: false,
                    timer: 1000,
                })
                document.getElementById('total').innerHTML = (response.total)
                document.getElementById('discount').innerHTML = response.discountValue
                document.getElementById('CouponName').innerHTML = response.coupon
                console.log(response.coupon)
            } else if (response.couponUsed) {
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: "You are Already Used This Coupon",
                    showConfirmButton: false,
                    timer: 1000,
                });
            } else if (response.couponExpired) {
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: "Entered Coupon Expired",
                    showConfirmButton: false,
                    timer: 1000,
                });
            } else {
                Swal.fire({
                    position: "center",
                    icon: "warning",
                    title: "Invalid Coupon",
                    showConfirmButton: false,
                    timer: 1000,
                });
            }
        }
    })
}




function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                Swal.fire({
                    title: 'order placed successfully',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'OK',
                    timer: 1000,
                    icon: 'success',
                    showConfirmButton: false
                }).then(() => {
                    location.href = '/orders'
                })
            } else {
                Swal.alert("Payment Failed")
            }
        }
    })
}
