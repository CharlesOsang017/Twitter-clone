export const signup = async (req, res)=>{   
        res.send('Running from routes')    
}

export const login = async (req, res)=>{
    res.json({
        message: "Running from login route"
    })
}