function Toolkit()
{
    this.GetDefaultToolkit = function()
    {
        var defaulttoolkit = function () { }
        defaulttoolkit.beep()= function() {
            console.log("beep()");
        }
        return defaulttoolkit;
    }
    
}
