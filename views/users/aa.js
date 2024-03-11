// <%-include('../layouts/header.ejs')%>
// <%-include('../layouts/navbar.ejs')%>


// <style>
//     /* Import Google font - Poppins */
//     @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap");
//     * {
//         margin: 0;
//         padding: 0;
//         box-sizing: border-box;
//         font-family: "Poppins", sans-serif;
//     }
//     /* body {
//     min-height: 100vh;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     background: #4070f4;
//     } */
//     :where(.container-2, form, .input-field, header) {
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: center;
//     }

//     .container {
//         display: flex;
//         justify-content: center;
//     }
//     .container-2 {
//         background: #fff;
//         width: fit-content;
//         padding: 30px 65px;
//         border-radius: 12px;
//         row-gap: 20px;
//         box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
//     }
//     .container-2 header {
//         height: 65px;
//         width: 65px;
//         background: #4070f4;
//         color: #fff;
//         font-size: 2.5rem;
//         border-radius: 50%;
//     }
//     .container-2 h4 {
//         font-size: 1.25rem;
//         color: #333;
//         font-weight: 500;
//     }
//     form .input-field {
//         flex-direction: row;
//         column-gap: 10px;
//     }
//     .input-field input {
//         height: 45px;
//         width: 42px;
//         border-radius: 6px;
//         outline: none;
//         font-size: 1.125rem;
//         text-align: center;
//         border: 1px solid #ddd;
//     }
//     .input-field input:focus {
//         box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
//     }
//     .input-field input::-webkit-inner-spin-button,
//     .input-field input::-webkit-outer-spin-button {
//         display: none;
//     }
//     form button {
//         margin-top: 25px;
//         width: 100%;
//         color: #fff;
//         font-size: 1rem;
//         border: none;
//         padding: 9px 0;
//         cursor: pointer;
//         border-radius: 6px;
//         /* pointer-events: none; */
//         background: #6e93f7;
//         transition: all 0.2s ease;
//     }
//     form button.active {
//         background: #4070f4;
//         pointer-events: auto;
//     }
//     form button:hover {
//         background: #0e4bf1;
//     }
// </style>



// <main class="main">

//     <div class="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17" style="background-image: url('user/assets/images/backgrounds/login-bg.jpg')">
//         <div class="container">
//             <div class="form-box">
//                 <div class="form-tab">
//                     <ul class="nav nav-pills nav-fill" role="tablist">
//                         <li class="nav-item">
//                             <a class="nav-link active" id="otp-verification" data-toggle="tab" role="tab" aria-controls="register-2" aria-selected="true">OTP Verification</a>
//                         </li>
//                     </ul>
//                     <br>
//                     <div class="tab-content">
//                         <div class="tab-pane fade show active" id="signin-2" role="tabpanel" aria-labelledby="signin-tab-2">
                            
                                
//                                 <div class="container-2">
//                                     <!-- <header>
//                                         <i class="bx bxs-check-shield"></i>
//                                     </header> -->
//                                     <h4>Enter OTP Code</h4>
//                                     <form action="/otp" method="POST">
//                                         <div class="input-field">
//                                             <input name="digit1" type="text" required   />
//                                             <input name="digit2" type="text" required disabled />
//                                             <input name="digit3" type="text"  required disabled/>
//                                             <input name="digit4" type="text" required disabled />
//                                             <input type="text"   name="email" hidden>
//                                         </div>
//                                         <a href="#">Resend OTP</a>
//                                         <button type="submit">Verify OTP</button>
//                                     </form>
//                                 </div>
                            
//                         </div><!-- .End .tab-pane -->
                        
//                     </div><!-- End .tab-content -->
//                 </div><!-- End .form-tab -->
//             </div><!-- End .form-box -->
//         </div><!-- End .container -->
//     </div><!-- End .login-page section-bg -->
// </main><!-- End .main -->

// <script>
//     const inputs = document.querySelectorAll("input"),
//     button = document.querySelector("button");

//     // iterate over all inputs
//     inputs.forEach((input, index1) => {
//         input.addEventListener("keyup", (e) => {
//             // This code gets the current input element and stores it in the currentInput variable
//             // This code gets the next sibling element of the current input element and stores it in the nextInput variable
//             // This code gets the previous sibling element of the current input element and stores it in the prevInput variable
//             const currentInput = input,
//             nextInput = input.nextElementSibling,
//             prevInput = input.previousElementSibling;

//             // if the value has more than one character then clear it
//             if (currentInput.value.length > 1) {
//                 currentInput.value = "";
//                 return;
//             }
//             // if the next input is disabled and the current value is not empty
//             //  enable the next input and focus on it
//             if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
//                 nextInput.removeAttribute("disabled");
//                 nextInput.focus();
//             }

//             // if the backspace key is pressed
//             if (e.key === "Backspace") {
//                 // iterate over all inputs again
//                 inputs.forEach((input, index2) => {
//                 // if the index1 of the current input is less than or equal to the index2 of the input in the outer loop
//                 // and the previous element exists, set the disabled attribute on the input and focus on the previous element
//                 if (index1 <= index2 && prevInput) {
//                         input.setAttribute("disabled", true);
//                         input.value = "";
//                         prevInput.focus();
//                     }
//                 });
//             }
//             //if the fourth input( which index number is 3) is not empty and has not disable attribute then
//             //add active class if not then remove the active class.
//             if (!inputs[3].disabled && inputs[3].value !== "") {
//                 button.classList.add("active");
//                 return;
//             }
//             button.classList.remove("active");
//         });
//     });

//     //focus the first input which index is 0 on window load
//     window.addEventListener("load", () => inputs[0].focus());
// </script>

// <%-include('../layouts/footerNav.ejs')%>
// <%-include('../layouts/footer.ejs')%>