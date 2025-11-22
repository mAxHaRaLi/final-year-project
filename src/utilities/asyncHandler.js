const asyncHandler = (requestHandler) =>{
    (req , res , next)=>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((err)=>next(err))
    }
}




export default asyncHandler;

// const asynchandler = () =>{}
    // const asynchandler = (fun) =>() => {}
// const asynchandler = (fun) => async (req , res , next) => {
//     try{
//         await fn(req ,res, next)

//     } catch(error){
//         res.status(error.code || 500 .json({
//             success:false,
//             message:error.message
//         }))

//     }
// }