--[[
   Uses Javascript redirection with base64-encoded URL's to mitigate bot clicks
   Optionally tests if cookies and/or flash are supported by the client
--]]

--[[ 

	JAVASCRIPT DEFAULT ON 
	Edit false to true to activate other checks
	
--]]
	
local flashTest=false
local cookieTest=false
local token='RDiR3KT'
local b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function enc(data)
    return ((data:gsub('.', function(x)
        local r,b='',x:byte()
        for i=8,1,-1 do r=r..(b%2^i-b%2^(i-1)>0 and '1' or '0') end
        return r;
    end)..'0000'):gsub('%d%d%d?%d?%d?%d?', function(x)
        if (#x < 6) then return '' end
        local c=0
        for i=1,6 do c=c+(x:sub(i,i)=='1' and 2^(6-i) or 0) end
        return b:sub(c+1,c+1)
    end)..({ '', '==', '=' })[#data%3+1])
end

function sfail(r)
   if (cookieTest) then
          io.write("Set-Cookie: " .. token .. "=\n")
   end

   io.write("Content-type: text/html\n\n<!-- " .. r .. " -->\n")
end

function jsredirect(url, tokenval)
   if (cookieTest) then
      io.write("Set-Cookie: " .. token .. "=" .. tokenval .. "\n")
   end

   io.write(
      "Content-type: text/html\n\n" ..
          "<html><body>" ..
          "<script type=\"text/javascript\">" ..
          "<!--\n")

          if (flashTest) then
                 io.write(
[[var hasFlash = false;
try { var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash'); if (fo) { hasFlash = true; }
} catch (e) { if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] != undefined
&& navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) { hasFlash = true; } } if (hasFlash) { ]])
          end

          io.write("window.location = atob(\"" .. enc(url) .. "\")\n")

          if (flashTest) then
                 io.write("}\n")
          end

          io.write("//--></script></body></html>\n")
end

function envtest()
   if (REQUEST_URI == nil or REMOTE_ADDR == nil or SERVER_NAME == nil) then
          return 0
   end

   return 1
end

function preclick()
   x = envtest()
   if (x == 0) then
          sfail('e')
          return 0
   end

   if (string.find(REQUEST_URI, token)) then
          if (cookieTest) then
                 if (COOKIE[token] == nil) then
                        sfail('1')
                        return 0
                 end

                 if (COOKIE[token] ~= REMOTE_ADDR) then
                        sfail('2')
                        return 0
                 end
          end

          return 1;
   end

   url='http://' .. SERVER_NAME .. REQUEST_URI .. '/' .. token .. '/'
   jsredirect(url, REMOTE_ADDR)

   return 0
end

function clickthru(url)
   if (string.len(url) == 0) then
          sfail('3')
          return
   end

   url = url:gsub('/' .. token .. '/', '')

   io.write("Content-Type: text/html\n\n<meta http-equiv=\"refresh\" content=\"0;url='" .. url .. "'\">\n\n")
end
