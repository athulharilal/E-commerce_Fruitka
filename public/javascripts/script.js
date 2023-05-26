const { response } = require("../../app");

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
			url:'/add-to-wishlist/'+proId,
			method:'get',
			success:(response)=>{
				if (response.status) {
					let count = $('#wishlist-count').html()
					count = parseInt(count)+1
					$('wishlist-count').html(count)
					Swal.fire({
						icon:"sucess",
						title:"Items are Added to the Wishlist",
						showConfirmButton:false,
						timer:1000
					})
				}else{
					let count = $('#wishlist-count').html()
					count = parseInt(count)-1
					$('#wishlist-count').html(count)
					document.getElementById(proId).style.backgroundColor='#FFD333'
					Swal.fire({
						icon:"sucesss",
						title:"Item Removed from wishlist",
						showConfirmButton:false,
						timer:1000
					})
					document.getElementById(proId).style.color="grey";

				}
			}
		})
	}

	function removeWishlist(proID) {
		$.ajax({
			url:'/remove-wishlist/'+proID,
			method:'delete',
			success:(response)=>{
				if (response.status) {
					let count  = $('#wishlist-counts').html()
					count = parseInt(count)+1
					$('#wishlist-counts').html(count)
					swal.fire({
						icon:"Sucess",
						title:"Item deleted form wishlists",
						showConfirmButton:false,
						timer:1000,
					}).then(()=>{
						location.reload()
					})
				}
			}
		})
	}
	
